#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <malloc.h>
#include "common.h"
#include "encoder.h"
#include "decoder.h"

#define MAX_FRAGS (256 / CHAR_BIT)

struct CodingRatio
{
    short int antecedent;
    short int consequent;
};

static int parseCodingRatio(const char *arg, struct CodingRatio *cr);
static void createMissingFragsList(unsigned char *missingFrags, short int numLosses, short int nLdpc);
static int isFragInList(unsigned char *missingFrags, short int numLosses, short int frag);

/*
 * nLdpc(cr.consequent)>mLdpc(cr.antecedent), ��Ϊ�ӽ������
 * fragsizeΪÿһ����Ҫ���ܶ��ٸ�Byte 128��unsigned char������fragsizeΪ4,����Ҫ32��
 * eg: ldpcEncode(message,inLen,nLdpc,mLdpc,fragSize,&encoded[0])
 *     message�����뵽encoded��0��ʼ��inLen��unsigned char�ϣ�����ʹ��
 *     ���������룬����ʹ��forѭ��
 *  eg:for (i = 0; i < nLdpc; i++)
 *  {
 *       ldpcEncode(message,inLen,nLdpc,mLdpc,fragSize,&encoded[i*size]); //sizeΪ����ķ�Ƭ��С
 *   }   mLdpc<=inLen
 */
int ldpcEncode(unsigned char *message, int inLen, short int nLdpc, short int mLdpc, short int fragSize, unsigned char *encoded)
{

    struct CodingRatio cr;
    int inLenRounded;
    short int i;
    int r;
    unsigned char **a;
    int mmldpc, nnldpc;
    cr.antecedent = mLdpc;
    cr.consequent = nLdpc;
    // �������ȫ�ĳ���ȷ����ʵ����������ȷ��ָ��
    mLdpc = inLen / fragSize;
    for (i = 0; i < nLdpc; i++)
    {
        encode(message, i, mLdpc, fragSize, &encoded[i * fragSize]);
    }
    return 1;
}
/*
 * nLdpc(cr.consequent)>mLdpc(cr.antecedent), ��Ϊ�ӽ������
 * fragsizeΪÿһ����Ҫ���ܶ��ٸ�Byte 128��unsigned char������fragsizeΪ4,����Ҫ32��
 * eg: ldpcDecode(encoded,inLen,nLdpc,mLdpc,fragSize,&decoded[0])
 *     message�����뵽encoded��0��ʼ��inLen��unsigned char�ϣ�����ʹ��
 *     ���������룬����ʹ��forѭ��
 *  eg:for (i = 0; i < nLdpc; i++)
 *  {
 *       ldpcDecode(encoded,inLen,nLdpc,mLdpc,fragSize,&decoded[i*szie]); //sizeΪ����ķ�Ƭ��С
 *   }
 */
int ldpcDecode(unsigned char *encoded, int inLen, short int nLdpc, short int mLdpc, short int fragSize, unsigned char *decoded)
{

    struct CodingRatio cr;

    short int i;
    int r;
    unsigned char **a;
    int mmLdpc, nnLdpc;
    cr.antecedent = mLdpc;
    cr.consequent = nLdpc;

    // ���Ʋ���ȫ

    // �������ȫ�ĳ���ȷ����ʵ����������ȷ��ָ��
    mLdpc = inLen / fragSize;
    nLdpc = (mLdpc / cr.antecedent + (mLdpc % cr.antecedent != 0)) * cr.consequent;

    // a���ڽ���
    a = (unsigned char **)malloc(sizeof(unsigned char *) * mLdpc);
    for (i = 0; i < mLdpc; i++)
    {
        a[i] = (unsigned char *)malloc(mLdpc / CHAR_BIT + (mLdpc % CHAR_BIT != 0));
        memset(a[i], 0, mLdpc / CHAR_BIT + (mLdpc % CHAR_BIT != 0));
    }
    for (i = 0; i < nLdpc; i++)
    {
        r = decode(&encoded[i * fragSize], i, mLdpc, fragSize, &decoded[0], a);
    }
    for (i = 0; i < mLdpc; i++)
    {
        free(a[i]);
    }
    free(a);
    return 0;
}

static int parseCodingRatio(const char *arg, struct CodingRatio *cr)
{
    char *next;
    cr->antecedent = (short int)strtol(arg, &next, 10);
    if (cr->antecedent != 0 && next[0] != '\0' && next[1] != '\0')
    {
        cr->consequent = (short int)strtol(&next[1], NULL, 10);
        return cr->consequent != 0 ? 0 : EINVAL;
    }
    else
    {
        return EINVAL;
    }
}

static void createMissingFragsList(unsigned char *missingFrags, short int numLosses, short int nLdpc)
{
    short int i, frag;
    memset(missingFrags, 0, MAX_FRAGS);
    for (i = 0; i < numLosses; i++)
    {
        do
        {
            frag = rand() % nLdpc;
        } while (isFragInList(missingFrags, numLosses, frag));
        missingFrags[frag / CHAR_BIT] |= (1 << (frag % CHAR_BIT));
    }
}

static int isFragInList(unsigned char *missingFrags, short int numLosses, short int frag)
{
    return (missingFrags[frag / CHAR_BIT] & (1 << (frag % CHAR_BIT))) != 0;
}
