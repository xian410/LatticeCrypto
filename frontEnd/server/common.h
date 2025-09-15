#pragma once

#define MAX_BITMAP_SIZE 512 // Assumption: mLdpc will never specify more fragments than can be represented by this.

void xorLdpc(unsigned char *v1, unsigned char *v2, int mLdpc);
/*
  Sets the value of the bytes of vector v2 into v1. Each vector is of size mLdpc bytes.
*/
/*
  Generates a parity-check vector, of length mLdpc.
  Refer to figure 1 of the LoRaWAN Fragmented Data Block Transport v1.0.0 document.
  When nLdpc < mLdpc, the vector will have a 1 set in the position nLdpc, while other bits will be 0. An identify matrix is formed when the first M results are combined into a matrix.
  When nLdpc ¡Ý mLdpc, the vector will contain as statistically as many 0s and 1s. The order is pseudo-random, derived from nLdpc.
  nLdpc is the line number [0...N], of this vector.
  mLdpc is the number of data fragments. nLdpc may be higher than mLdpc, when there are reduncy fragments (which are coded).
*/
void matrixLine(unsigned char *matrix, int nLdpc, int mLdpc);

/*
  Performs a logical XOR across all bytes of the vectors v1 and v2, storing the result in v1.
  Each vector is of size mLdpc bytes.
*/

void set(unsigned char *v1, unsigned char *v2, int mLdpc);
/*
  Sets the specified bit of vector v, to 1.
*/
void setBit(unsigned char *v, int bit);
/*
  Returns the value of the given bit, of vector v.
*/
int getBit(unsigned char *v, int bit);
