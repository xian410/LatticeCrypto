// SM3.cpp : ??????????��????????
//

// #include "stdafx.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string>

using namespace std;

typedef unsigned int u32;
typedef unsigned char u8;
typedef unsigned long long u64;
///////////////////////////////////////
///
///  ????7??????????????????????
///
///////////////////////////////////////
#define FF1(X, Y, Z) (X ^ Y ^ Z)
#define FF2(X, Y, Z) ((X & Y) | (X & Z) | (Y & Z))
#define GG1(X, Y, Z) (X ^ Y ^ Z)
#define GG2(X, Y, Z) ((X & Y) | ((~X) & Z))
#define ROTL32(X, num) ((X << num) | (X >> (32 - num)))
#define P0(X) ((X) ^ ROTL32((X), 9) ^ ROTL32((X), 17))
#define P1(X) ((X) ^ ROTL32((X), 15) ^ ROTL32((X), 23))

//??32bit??????????????????????
#define REVERSE32(w, x)                                            \
	{                                                                \
		u32 tmp = (w);                                                 \
		tmp = (tmp >> 16) | (tmp << 16);                               \
		(x) = (((tmp & 0xff00ff00) >> 8) | ((tmp & 0x00ff00ff) << 8)); \
	}
typedef struct
{
	u32 state[8];
	u64 bitcount;
	u32 buffer[16];
} SM3_256_CTX;

/////////////Set Init Value////////////////
const u32 T[64] = {0x79cc4519, 0xf3988a32, 0xe7311465, 0xce6228cb, 0x9cc45197, 0x3988a32f, 0x7311465e, 0xe6228cbc, 0xcc451979, 0x988a32f3, 0x311465e7, 0x6228cbce,
									 0xc451979c, 0x88a32f39, 0x11465e73, 0x228cbce6, 0x9d8a7a87, 0x3b14f50f, 0x7629ea1e, 0xec53d43c, 0xd8a7a879, 0xb14f50f3, 0x629ea1e7, 0xc53d43ce, 0x8a7a879d,
									 0x14f50f3b, 0x29ea1e76, 0x53d43cec, 0xa7a879d8, 0x4f50f3b1, 0x9ea1e762, 0x3d43cec5, 0x7a879d8a, 0xf50f3b14, 0xea1e7629, 0xd43cec53, 0xa879d8a7, 0x50f3b14f,
									 0xa1e7629e, 0x43cec53d, 0x879d8a7a, 0x0f3b14f5, 0x1e7629ea, 0x3cec53d4, 0x79d8a7a8, 0xf3b14f50, 0xe7629ea1, 0xcec53d43, 0x9d8a7a87, 0x3b14f50f, 0x7629ea1e,
									 0xec53d43c, 0xd8a7a879, 0xb14f50f3, 0x629ea1e7, 0xc53d43ce, 0x8a7a879d, 0x14f50f3b, 0x29ea1e76, 0x53d43cec, 0xa7a879d8, 0x4f50f3b1, 0x9ea1e762, 0x3d43cec5};

//???��??????????IV
void SM3_256_Init(SM3_256_CTX *ctx)
{
	u32 IH[8] = {0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e};
	int i;
	for (i = 0; i < 8; i++)
	{
		ctx->state[i] = IH[i];
	}
	memset(ctx->buffer, 0, sizeof(u32) * 16);
	ctx->bitcount = 0;
}

///////////////////////////////////////
///
///  SM3_256_Block????????512 bit??????????????ctx?��?state???
///
///////////////////////////////////////
void SM3_256_Block(SM3_256_CTX *ctx)
{
	u32 A, B, C, D, E, F, G, H, temp;
	u32 SS1, SS2, TT1, TT2, Const;
	u32 W[68] = {0};
	int i;
	u32 t;
	u32 t1, t2 = 0x7a879d8a;
	A = ctx->state[0];
	B = ctx->state[1];
	C = ctx->state[2];
	D = ctx->state[3];
	E = ctx->state[4];
	F = ctx->state[5];
	G = ctx->state[6];
	H = ctx->state[7];
	////////////////Expand Message Block(??????)/////////////////////
	W[0] = ctx->buffer[0];
	W[1] = ctx->buffer[1];
	W[2] = ctx->buffer[2];
	W[3] = ctx->buffer[3];
	W[4] = ctx->buffer[4];
	W[5] = ctx->buffer[5];
	W[6] = ctx->buffer[6];
	W[7] = ctx->buffer[7];
	W[8] = ctx->buffer[8];
	W[9] = ctx->buffer[9];
	W[10] = ctx->buffer[10];
	W[11] = ctx->buffer[11];
	W[12] = ctx->buffer[12];
	W[13] = ctx->buffer[13];
	W[14] = ctx->buffer[14];
	W[15] = ctx->buffer[15];
	for (i = 16; i < 68; i++)
	{
		temp = W[i - 16] ^ W[i - 9] ^ ROTL32(W[i - 3], 15);
		W[i] = P1(temp) ^ ROTL32(W[i - 13], 7) ^ W[i - 6];
	}

	/////////////Compression Function???????????///////////////////////

	for (i = 0; i < 64; i++)
	{
		if (i < 16)
		{
			Const = 0x79cc4519;
			SS1 = ROTL32(ROTL32(A, 12) + E + ROTL32(Const, i), 7);
			SS2 = SS1 ^ ROTL32(A, 12);
			TT1 = FF1(A, B, C) + D + SS2 + (W[i] ^ W[i + 4]);
			TT2 = GG1(E, F, G) + H + SS1 + W[i];
		}
		else
		{
			Const = 0x7a879d8a;
			SS1 = ROTL32(ROTL32(A, 12) + E + ROTL32(Const, i), 7);
			SS2 = SS1 ^ ROTL32(A, 12);
			TT1 = FF2(A, B, C) + D + SS2 + (W[i] ^ W[i + 4]);
			TT2 = GG2(E, F, G) + H + SS1 + W[i];
		}
		D = C;
		C = ROTL32(B, 9);
		B = A;
		A = TT1;
		H = G;
		G = ROTL32(F, 19);
		F = E;
		E = P0(TT2);
	}

	//???????
	ctx->state[0] ^= A;
	ctx->state[1] ^= B;
	ctx->state[2] ^= C;
	ctx->state[3] ^= D;
	ctx->state[4] ^= E;
	ctx->state[5] ^= F;
	ctx->state[6] ^= G;
	ctx->state[7] ^= H;
}

///////////////////SM3 256 Hash function/////////////////////
///////////////////////////////////////
///
///  ????SM3????hash????
///  Inmessage????????????, MessageLen???????????��????
///  OutDigest??????????, DigestLen ??????????��????
///
///////////////////////////////////////
void SM3(unsigned char *InMessage, int MessageLen, unsigned char *OutDigest, int *DigestLen)
{
	u32 *p_data = (u32 *)InMessage;
	int i, j;
	SM3_256_CTX ctx;
	u32 *p_out = (u32 *)OutDigest;
	SM3_256_Init(&ctx);

	if (MessageLen == 0)
		return;
	while (MessageLen >= 64) //??????��?��?��??512 bit??
	{
		for (i = 0; i < 16; i++)
		{
			REVERSE32(*p_data, ctx.buffer[i]);
			p_data++;
		}
		SM3_256_Block(&ctx);
		ctx.bitcount += 512;
		MessageLen -= 64;
	}
	///////////////////padding?????//////////////////////////
	for (i = 0; i < (MessageLen / 4); i++)
	{
		REVERSE32(*p_data, ctx.buffer[i]);
		p_data++;
	}
	MessageLen -= 4 * i;
	ctx.bitcount += 32 * i;
	switch (MessageLen)
	{
	case 0:
		ctx.buffer[i] = (0x80) << 24;

		break;
	case 1:
		ctx.buffer[i] = ((*(unsigned char *)p_data) << 24) | (0x80 << 16);
		ctx.bitcount += 8;
		break;
	case 2:
		ctx.buffer[i] = ((*(unsigned char *)p_data) << 24) | ((*((unsigned char *)p_data + 1)) << 16) | (0x80 << 8);
		ctx.bitcount += 16;
		break;
	case 3:
		ctx.buffer[i] = ((*(unsigned char *)p_data) << 24) | ((*((unsigned char *)p_data + 1)) << 16) | ((*((unsigned char *)p_data + 2)) << 8) | 0x80;
		ctx.bitcount += 24;
		break;
	}
	memset(&ctx.buffer[i + 1], 0, sizeof(u32) * (15 - i));
	if (i < 56)
	{
		ctx.buffer[14] = ctx.bitcount >> 32;
		ctx.buffer[15] = ctx.bitcount & 0xFFFFFFFFF;
		SM3_256_Block(&ctx);
	}
	else
	{
		SM3_256_Block(&ctx);
		memset(ctx.buffer, 0, sizeof(u32) * 16);
		*(u64 *)(&ctx.buffer[15]) = ctx.bitcount;
	}
	// memcpy(OutDigest,ctx.state,sizeof(u32)*8);
	for (i = 0; i < 8; i++)
	{
		REVERSE32(ctx.state[i], *p_out);
		p_out++;
	}
	*DigestLen = 32;
}
