#include <cstring>
#include <limits.h>

#include "common.h"
#include "encoder.h"

void encode(unsigned char *in, int nLdpc, int mLdpc, int fragSize, unsigned char *out)
{
	int i;
	unsigned char matrix[MAX_BITMAP_SIZE];

	memset(out, 0, fragSize);
	matrixLine(matrix, nLdpc, mLdpc);
	for (i = 0; i < mLdpc; i++)
	{
		if (getBit(matrix, i))
		{
			xorLdpc(out, &in[i * fragSize], fragSize);
		}
	}
}
