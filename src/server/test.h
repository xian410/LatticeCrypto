
#include "ldpc.h"
#include <iostream>
#include <time.h>
#define uint8 unsigned char
#define uint32 unsigned int

int testEncode(unsigned int *inputMessage, int inLen, unsigned int *outputMessage, int outLend)
{
    /*
     * ��Ҫ��ʼ���Ĳ���
     * inLen������ĳ���
     * nLdpc(cr.consequent) > mLdpc(cr.antecedent):��Ϊ�ӽ������.
     * fragSize:����ķֿ鳤�ȣ�����ܱ�inLen����
     */
    int outLen;
    int nnLdpc, mmLdpc; // ���ڵ������ʴ���
    unsigned char *testMessage;
    unsigned char *testEncode;
    if (outLend % 8 == 0)
    {
        outLen = outLend;
    }
    else
    {
        outLen = ((outLend + 7) / 8) * 8;
    }
    // ����������ڳ�ʼ���ӽ�������
    // ��ʼ����Ϣ
    // ������Ķ��ֵΪ0��1��unsigned int messageת��Ϊunsigned char ����
    testMessage = (unsigned char *)malloc(inLen / 8 * sizeof(unsigned char));
    memset(testMessage, 0, inLen / 8);
    testEncode = (unsigned char *)malloc(outLen / 8 * sizeof(unsigned char));
    memset(testEncode, 0, outLen / 8);
    for (size_t i = 0; i < inLen / 8; i++)
    {
        for (int j = 0; j < 8; j++)
        {
            testMessage[i] += inputMessage[i * 8 + j];
            if (j == 7)
            {
                continue;
            }
            testMessage[i] = testMessage[i] << 1;
        }
    }
    // ����ת���Ƿ���ȷ
    // for (size_t i = 0; i < 128; i++) {
    //     // �����Ӧ���ֽںͱ���λ��
    //     size_t byteIndex = i / 8; // ��ȡ�ֽ�����
    //     size_t bitIndex = i % 8;  // ��ȡ��������

    //    // �����ǰ���ص�ֵ
    //    printf("%d, ", (testMessage[byteIndex] >> (7 - bitIndex)) & 1);
    //}
    // printf("\n");
    // for (size_t i = 0; i < inLen / 8; i++)
    // {
    //     printf("%02x ", testMessage[i]);
    // }
    // printf("\n");
    ldpcEncode(testMessage, inLen / 8, outLen / 8, inLen / 8, 1, testEncode);
    // for (size_t i = 0; i < outLen / 8; i++)
    // {
    //     printf("%02x ", testEncode[i]);
    // }
    // printf("\n");
    // �ѱ���������ת��ΪֵΪ0,1��unsigned int ��
    for (size_t i = 0; i < outLen / 8; i++)
    {
        for (size_t j = 0; j < 8; j++)
        {
            outputMessage[i * 8 + 7 - j] = (testEncode[i] >> j) & 1;
        }
    }
    return 0;
}
int testDecode(unsigned int *inputMessage, int inLend, unsigned int *outputMessage, int outLen)
{
    /* ,int inLen,int nLdpc,int mLdpc
     * ��Ҫ��ʼ���Ĳ���
     * inLen������ĳ���
     * nLdpc(cr.consequent) > mLdpc(cr.antecedent):��Ϊ�ӽ������.
     * fragSize:����ķֿ鳤�ȣ�����ܱ�inLen����
     */

    int inLen;
    int nnLdpc, mmLdpc; // ���ڵ������ʴ���
    unsigned char *encoded;
    unsigned char *Encoded;
    unsigned int *testEncoded;
    unsigned char *inBuf, *decoded;
    // ����������ڳ�ʼ���ӽ�������
    // ��ʼ����Ϣ
    if (inLend % 8 == 0)
    {
        inLen = inLend;
    }
    else
    {
        inLen = ((inLend + 7) / 8) * 8;
    }
    encoded = (unsigned char *)malloc(inLen * sizeof(unsigned char));
    memset(encoded, 0, inLen);
    Encoded = (unsigned char *)malloc(inLen / 8 * sizeof(unsigned char));
    memset(Encoded, 0, inLen / 8);
    decoded = (unsigned char *)malloc(outLen / 8 * sizeof(unsigned char));
    memset(decoded, 0, outLen / 8);
    testEncoded = (unsigned int *)malloc(outLen * sizeof(unsigned int));
    memset(testEncoded, 0, outLen);
    for (size_t i = 0; i < inLen; i++)
    {
        encoded[i] = inputMessage[i];
    }
    // printf("inputMessage:");
    /*for (size_t i = 0; i < 168; i++)
    {
        printf("%02x ",encoded[i]);
    }
    printf("\n");
    printf("encodedInputMessage:");*/
    // ������Ķ��ֵΪ0��1��unsigned int messageת��Ϊunsigned char ����
    for (size_t i = 0; i < inLen / 8; i++)
    {
        for (int j = 0; j < 8; j++)
        {
            Encoded[i] += encoded[i * 8 + j];
            if (j == 7)
            {
                continue;
            }
            Encoded[i] = Encoded[i] << 1;
        }
    }
    /*for (size_t i = 0; i < 21; i++)
    {
        printf("%02x ", Encoded[i]);
    }*/
    ldpcDecode(Encoded, inLen / 8, outLen / 8, inLen / 8, 1, decoded);
    // printf("\n");
    // printf("encodedOuputMessage:");
    // for (size_t i = 0; i < 16; i++)
    //{
    //     printf("%02x ", decoded[i]);
    // }
    // printf("\n");
    for (size_t i = 0; i < outLen; i++)
    {
        // �����Ӧ���ֽںͱ���λ��
        testEncoded[i] = (decoded[i / 8] >> (7 - i % 8)) & 1;
    }
    // for (size_t i = 0; i < 128; i++) {
    //     // �����Ӧ���ֽںͱ���λ��
    //     printf("%d, ", testEncoded[i];
    // }
    // printf("binaryencodedOuputMessage:");
    // for (size_t i = 0; i < 128; i++)
    //{
    //     printf("%d, ", outputMessage[i]);
    // }
    // printf("\n");
    for (int i = 0; i < outLen; i++)
    {
        outputMessage[i] = testEncoded[i];
    }
    return 0;
}