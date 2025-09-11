#include <cstring>
#include <limits.h>

#include "common.h"
#include "decoder.h"

static int allLinesOfAUpdated(unsigned char **a, int mLdpc);
static int positionOfLeadingOne(unsigned char *v, int mLdpc);

int decode(unsigned char *p, int nLdpc, int mLdpc, int fragSize, unsigned char *s, unsigned char **a)
{
	unsigned char c[MAX_BITMAP_SIZE];
	int i, j, leadingOne;

	do
	{
		// 1. fetch the corresponding line of the parity check matrix : C = matrix_line(N, M)
		matrixLine(c, nLdpc, mLdpc);

		// 2. Proceed from left to right along the C vector (? ??????? ???? 1 ?? ?)
		for (i = 0; i < mLdpc; i++)
		{
			// For each entry ?? equal to 1, check if the line ? of the matrix A contains a 1 in row ?.
			if (getBit(c, i) == 1 && getBit(a[i], i) == 1)
			{
				// perform a Xor between line ? of matrix A ��A(?)�� and the vector C and store the result in C
				xorLdpc(c, a[i], mLdpc / CHAR_BIT + (mLdpc % CHAR_BIT != 0));
				// perform a xorLdpc between PMN and the coded fragment stored at position ? in the fragment memory store ?? and update PMN with the result
				xorLdpc(p, &s[i * fragSize], fragSize);
			}
		}

		// 3
		leadingOne = positionOfLeadingOne(c, mLdpc);

		if (leadingOne < 0)
		{
			// 3a. C now contains only zeros, in that case just get rid of the coded fragment PMN; it isn��t bringing any new information
			return 0;
		}
		else
		{ // 3b
			// write it in the matrix A at the line ? corresponding to the first non-zero element of C
			set(a[leadingOne], c, mLdpc / CHAR_BIT + (mLdpc % CHAR_BIT != 0));
			// add the modified PMN fragment to the memory store at position ? : ??
			set(&s[leadingOne * fragSize], p, fragSize);
		}
		// 4. Loop to 1 until all lines of the matrix A have been updated
	} while (!allLinesOfAUpdated(a, mLdpc));

	// 5
	for (i = mLdpc - 1; i >= 0; i--)
	{
		for (j = mLdpc - 1; j > i; j--)
		{
			// For any 1 at position j> ? perform a xorLdpc between ?? and ?? and update ?? with the result.
			if (getBit(a[i], j))
			{
				xorLdpc(&s[i * fragSize], &s[j * fragSize], fragSize);
			}
		}
	}

	// 6. The fragment memory store now contains the original uncoded fragments ?? = ??
	return 1;
}

/*
	Returns whether all lines of A have been updated.
	The matrix A will have only 1��s on its diagonal and will be a triangular matrix with only 0��s on the lower left half.
*/
static int allLinesOfAUpdated(unsigned char **a, int mLdpc)
{
	int i;
	for (i = 0; i < mLdpc; i++)
	{
		if (positionOfLeadingOne(a[i], mLdpc) != i)
			return 0;
	}

	return 1;
}

int getMissing(unsigned char **a, int mLdpc)
{
	int i, missing;

	missing = 0;
	for (i = 0; i < mLdpc; i++)
	{
		if (positionOfLeadingOne(a[i], mLdpc) != i)
			missing++;
	}

	return missing;
}

/*
	Given a vector v of length mLdpc, returns the index of the first bit that is set to 1.
	If all bits are 0, -1 is returned.
*/
static int positionOfLeadingOne(unsigned char *v, int mLdpc)
{
	int i;

	for (i = 0; i < mLdpc; i++)
	{
		if (getBit(v, i))
		{
			return i;
		}
	}

	return -1;
}
