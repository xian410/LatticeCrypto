#pragma once
/*
  Decodes a coded fragment. There is no harm in passing more fragments than necessary.
  p is the input coded fragement (Pmn).
  nLdpc is the fragment number [0...N].
  mLdpc is the number of data fragments. nLdpc may be higher than mLdpc, when there are reduncy fragments (which are coded).
  fragSize is the size of each fragment, in bytes.
  s is a pointer to fragment storage (S).
  a is a 2D bit array (A).
  Returns whether all lines have been updated with new information, thus also indicates whether sufficient data has been received to decode the message.
  Thus 0 is returned until there is sufficient data. After which, 0 will be returned for further coded fragments provided.
 */
int decode(unsigned char *p, int nLdpc, int mLdpc, int fragSize, unsigned char *s, unsigned char **a);

/*
  Returns the number of missing fragments, for the message to be decoded successfully.
  a is a 2D bit array (A).
  mLdpc is the number of data fragments.
*/
int getMissing(unsigned char **a, int mLdpc);