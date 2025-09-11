#pragma once

/*
  Encodes a fragment.
  in is a pointer to data to encode, consisting of nLdpc fragments.
  nLdpc is the fragment number [0...N].
  mLdpc is the number of data fragments. nLdpc may be higher than mLdpc, when there are reduncy fragments (which are coded).
  fragSize is the size of each fragment, in bytes.
  out is a pointer to storage for the encoded fragment.
 */
void encode(unsigned char *in, int nLdpc, int mLdpc, int fragSize, unsigned char *out);