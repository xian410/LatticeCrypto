#ifdef __unix
#define fopen_s(pFile, filename, mode) ((*(pFile)) = fopen((filename), (mode))) == NULL
#endif

#include <cstring>
#include <iostream>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <cstring>
#include <cmath>
#include "hash.h"
#include "coding.h"
using namespace std;

int securityLevel = 128;
int n = 640;
int q = 16384;
int mm = 7;
int nn = 8;
int Szo = 5;
int Sun = 3;
int PKE_SECRETKEYBYTES = (2 * n * nn);
int PKE_PUBLICKEYBYTES = (32 + 2 * nn * n);
int PKE_BYTES = (2 * mm * n + 2 * mm * nn);
void changeParams(int type)
{
	switch (type)
	{
	case 128:
		securityLevel = 128;
		n = 640;
		q = 16384;
		mm = 7;
		nn = 8;
		Szo = 5;
		Sun = 3;
		PKE_SECRETKEYBYTES = (2 * n * nn);
		PKE_PUBLICKEYBYTES = (32 + 2 * nn * n);
		PKE_BYTES = (2 * mm * n + 2 * mm * nn);
		break;
	case 192:
		securityLevel = 192;
		n = 896;
		q = 16384;
		mm = 8;
		nn = 12;
		Szo = 5;
		Sun = 3;
		PKE_SECRETKEYBYTES = (2 * n * nn);
		PKE_PUBLICKEYBYTES = (32 + 2 * nn * n);
		PKE_BYTES = (2 * mm * n + 2 * mm * nn);
		break;
	case 256:
		securityLevel = 256;
		n = 1216;
		q = 32768;
		mm = 9;
		nn = 11;
		Szo = 5;
		Sun = 3;
		PKE_SECRETKEYBYTES = (2 * n * nn);
		PKE_PUBLICKEYBYTES = (32 + 2 * nn * n);
		PKE_BYTES = (2 * mm * n + 2 * mm * nn);
		break;
	case 384:
		securityLevel = 384;
		n = 1728;
		q = 32768;
		mm = 12;
		nn = 13;
		Szo = 5;
		Sun = 3;
		PKE_SECRETKEYBYTES = (2 * n * nn);
		PKE_PUBLICKEYBYTES = (32 + 2 * nn * n);
		PKE_BYTES = (2 * mm * n + 2 * mm * nn);
		break;
	default:
		break;
	}
}
struct RNG
{

	int outlen = 0;
	unsigned char InMessage[32] = {};
	int MessageLen;
	unsigned char output[32] = {0};

	void init(string in)
	{
		memset(InMessage, 0, sizeof(InMessage));
		MessageLen = (in.length() > 32) ? 32 : in.length();
		for (int i = 0; i < MessageLen; i++)
			InMessage[i] = in[i];
		SM3(InMessage, MessageLen, output, &outlen);
		for (int i = 0; i < MessageLen; i++)
			InMessage[i] = output[i];
	}
	void reset()
	{
		MessageLen = 32;
		SM3(InMessage, MessageLen, output, &outlen);
		for (int i = 0; i < MessageLen; i++)
			InMessage[i] = output[i];
	}

	void call_bytes(unsigned char *re, int number)
	{

		if (number > outlen)
			this->reset();

		for (int i = 0; i < number; i++)
			re[i] = output[outlen - number + i];
		re[number] = '\0';
		output[outlen - number] = '\0';
		outlen -= number;
	}

} RNG_1;

int sampler(int a, int b)
{ //???? a??ZO+b??????

	int bytes_need_1 = ceil(2 * a / 8.0);
	int bytes_need_2 = ceil(log(pow(3.0, b * 1.0)) / log(2) / 8.0);

	unsigned char *output = new unsigned char[33];
	memset(output, 0, 33 * sizeof(unsigned char));

	RNG_1.call_bytes(output, bytes_need_1);

	int sum = 0;
	int i = 0;
	int j = 0;
	int cnt = 0;
	int res = 1;
	while (cnt < 2 * a)
	{
		sum += res * ((output[i] >> (j)) & 1);
		j = (j + 1) % 8;
		if (j == 0)
			i++;
		cnt++;
		if (cnt == a)
			res = -1;
	}

	int try1 = 0;
	RNG_1.call_bytes(output, bytes_need_2);

	while ((((unsigned int *)output)[0] % (int)(pow(2.0, ceil(log(pow(3.0, b * 1.0)) / log(2)))) * 1.0) >= pow(3.0, b * 1.0))
	{
		RNG_1.call_bytes(output, bytes_need_2);
	}
	int ss = (((unsigned int *)output)[0] % (int)(pow(2.0, ceil(log(pow(3.0, b * 1.0)) / log(2)))) * 1.0);
	int sum2 = 0;
	int tt;
	// cout << ss << endl;
	cnt = 0;
	while (ss != 0)
	{
		tt = ss % 3;
		ss = ss / 3;
		if (tt == 0)
			sum2 += -1;
		else if (tt == 2)
			sum2 += 1;
		cnt++;
	}
	if (cnt < b)
		sum2 -= (b - cnt);

	return sum2 + sum;
}

int pke_keygen(unsigned char *pk, unsigned char *sk)
{ // ???????

	//????????????????

	string in;

	in = to_string(rand());

	RNG_1.init(in);
	unsigned char output[33];

	RNG_1.call_bytes(output, 32);
	in = (char *)output;
	RNG_1.init(in);
	for (int i = 0; i < 8; i++)
		((unsigned int *)pk)[i] = ((unsigned int *)output)[i];

	//?????????????????????? A (n*n)
	int cnt = 0;
	int **A = new int *[n];
	for (int i = 0; i < n; i++)
	{
		A[i] = new int[n];
		for (int j = 0; j < n; j++)
		{
			if (cnt == 0)
			{
				RNG_1.call_bytes(output, 32);
			}
			A[i][j] = ((unsigned int)(((short int *)output)[cnt])) % q;

			cnt = (cnt + 1) % 16;
		}
	}

	in = to_string(time(0));
	RNG_1.init(in);

	//?????????????????????? S (n*nn)
	int **S = new int *[n];
	for (int i = 0; i < n; i++)
	{
		S[i] = new int[nn];
		for (int j = 0; j < nn; j++)
		{
			S[i][j] = sampler(Szo, Sun);
			((short int *)sk)[i * nn + j] = S[i][j];
		}
	}

	//?????????????????????? E (n*nn)
	int **E = new int *[n];
	for (int i = 0; i < n; i++)
	{
		E[i] = new int[nn];
		for (int j = 0; j < nn; j++)
		{
			E[i][j] = sampler(Szo, Sun);
		}
	}

	//???? B=AS+E  (n*nn)
	unsigned int **B = new unsigned int *[n];
	long long tmp;

	for (int i = 0; i < n; i++)
	{
		B[i] = new unsigned int[n];
		for (int j = 0; j < nn; j++)
		{
			tmp = 0;
			for (int ii = 0; ii < n; ii++)
				tmp += (A[i][ii] * S[ii][j]) % q;
			tmp = (tmp + E[i][j]) % q;
			// cout << tmp << endl;
			if (tmp > 0)
				B[i][j] = (unsigned int)tmp;
			else
				B[i][j] = (unsigned int)(q + tmp);
			((unsigned short int *)pk)[16 + i * nn + j] = B[i][j];
		}
	}

	/*
	for (int i = 0; i < PKE_PUBLICKEYBYTES / 4; i++)
		cout << i << " " << ((unsigned int*)pk)[i] << endl;

	for (int i = 0; i <PKE_SECRETKEYBYTES/4;i++)

		cout << i << " " << ((int*)sk)[i] << endl;
	*/

	/*ofstream out("out.txt");
	for (int i = 0; i < q; i++)
		out <<i<<" "<< tj[i] << endl;*/

	return 0;
}

int pke_enc(unsigned char *pk, unsigned char *m, unsigned long long mlen, unsigned char *c, unsigned long long *clen, int securityLevel)
{
	//??? A
	string in;
	unsigned char output[33];
	unsigned char *seed[32];
	for (int i = 0; i < 8; i++)
		((unsigned int *)seed)[i] = ((unsigned int *)pk)[i];
	in = (char *)seed;
	RNG_1.init(in);

	int cnt = 0;
	// cout<<"n:"<<n<<endl;
	int **A = new int *[n];
	for (int i = 0; i < n; i++)
	{
		A[i] = new int[n];
		for (int j = 0; j < n; j++)
		{
			if (cnt == 0)
			{
				RNG_1.call_bytes(output, 32);
			}
			A[i][j] = ((unsigned int)(((short int *)output)[cnt])) % q;
			cnt = (cnt + 1) % 16;
		}
	}

	//??? B
	unsigned int **B = new unsigned int *[n];
	;
	for (int i = 0; i < n; i++)
	{
		B[i] = new unsigned int[nn];
		for (int j = 0; j < nn; j++)
		{
			B[i][j] = ((unsigned short int *)pk)[16 + i * nn + j];
		}
	}

	in = to_string(time(0));
	RNG_1.init(in);

	//?????????????????????? SS (mm*n)
	int **SS = new int *[mm];
	for (int i = 0; i < mm; i++)
	{
		SS[i] = new int[n];
		for (int j = 0; j < n; j++)
		{
			SS[i][j] = sampler(Szo, Sun);
		}
	}

	//?????????????????????? EE1 (mm*nn)
	int **EE1 = new int *[mm];
	for (int i = 0; i < mm; i++)
	{
		EE1[i] = new int[n];
		for (int j = 0; j < n; j++)
		{
			EE1[i][j] = sampler(Szo, Sun);
		}
	}

	//?????????????????????? EE2 (mm*nn)
	int **EE2 = new int *[mm];
	for (int i = 0; i < mm; i++)
	{
		EE2[i] = new int[nn];
		for (int j = 0; j < nn; j++)
		{
			EE2[i][j] = sampler(Szo, Sun);
		}
	}

	//???? BB=SS*A +EE1  (mm* n)
	unsigned int **BB = new unsigned int *[mm];
	long long tmp;

	for (int i = 0; i < mm; i++)
	{
		BB[i] = new unsigned int[n];
		for (int j = 0; j < n; j++)
		{
			tmp = 0;
			for (int ii = 0; ii < n; ii++)
				tmp += (SS[i][ii] * A[ii][j]) % q;
			tmp = (tmp + EE1[i][j]) % q;
			// cout << tmp << endl;
			if (tmp > 0)
				BB[i][j] = (unsigned int)tmp;
			else
				BB[i][j] = (unsigned int)(q + tmp);
			((unsigned short int *)c)[i * n + j] = BB[i][j];
		}
	}

	//???? V=SS*B +EE2  (mm*nn)
	unsigned int **V = new unsigned int *[mm];

	// �޸Ĳ���λ��
	// encoding
	// lΪ��Ϣ�ĳ���
	int l = securityLevel;
	unsigned int a[max_word_length];
	unsigned int b[max_word_length];

	memset(a, 0, sizeof(a));

	for (int i = 0; i < l; i++)
	{
		a[i] = ((unsigned int *)m)[i];
	}

	messageEnc(a, b, FAST, l);

	for (int i = 0; i < mm; i++)
	{
		V[i] = new unsigned int[nn];
		for (int j = 0; j < nn; j++)
		{
			tmp = 0;
			for (int ii = 0; ii < n; ii++)
				tmp += (SS[i][ii] * B[ii][j]) % q;
			// tmp = (tmp + EE2[i][j]+encode((((unsigned int*)m)[i*nn+j])) )% q;
			tmp = (tmp + EE2[i][j] + b[i * nn + j]) % q;
			// cout << tmp << endl;
			if (tmp > 0)
				V[i][j] = (unsigned int)tmp;
			else
				V[i][j] = (unsigned int)(q + tmp);
			((unsigned short int *)c)[mm * n + i * nn + j] = V[i][j];
		}
	}

	(*clen) = PKE_BYTES;
	return 0;
}

int pke_dec(unsigned char *sk, unsigned char *c, unsigned long long clen, unsigned char *m, unsigned long long *mlen, int securityLevel)
{

	//???BB
	unsigned int **BB = new unsigned int *[mm];

	for (int i = 0; i < mm; i++)
	{
		BB[i] = new unsigned int[n];
		for (int j = 0; j < n; j++)
			BB[i][j] = ((unsigned short int *)c)[i * n + j];
	}

	//???V
	unsigned int **V = new unsigned int *[mm];

	for (int i = 0; i < mm; i++)
	{
		V[i] = new unsigned int[nn];
		for (int j = 0; j < nn; j++)
			V[i][j] = ((unsigned short int *)c)[mm * n + i * nn + j];
	}

	unsigned int b[max_word_length];
	unsigned int cc[max_word_length];

	//???? D=V-BB*S  (mm*nn)
	unsigned int **D = new unsigned int *[mm];
	long long tmp;
	for (int i = 0; i < mm; i++)
	{
		D[i] = new unsigned int[nn];
		for (int j = 0; j < nn; j++)
		{
			tmp = 0;
			for (int ii = 0; ii < n; ii++)
				tmp += BB[i][ii] * ((unsigned short int *)sk)[ii * nn + j];
			tmp = (V[i][j] - tmp) % q;
			if (tmp > 0)
				D[i][j] = (unsigned int)tmp;
			else
				D[i][j] = (unsigned int)(q + tmp);
			b[i * nn + j] = D[i][j];
			//((unsigned int*)m)[i*nn + j]=decode(D[i][j]);
		}
	}

	// decoding
	int l = securityLevel;

	messageDec(b, cc, FAST, l);
	for (int i = 0; i < l; i++)
		((unsigned int *)m)[i] = cc[i];

	(*mlen) = l * 4;

	return 0;
}

void genInstance(int type)
{
	changeParams(type);
	printf("Generate instance!\n");
	unsigned char *pk = new unsigned char[PKE_PUBLICKEYBYTES];
	unsigned char *sk = new unsigned char[PKE_SECRETKEYBYTES];
	unsigned char *m = new unsigned char[securityLevel * 4 * 4];
	unsigned char *m2 = new unsigned char[securityLevel * 4 * 4];
	unsigned char *c = new unsigned char[PKE_BYTES];
	unsigned long long clen, mlen;
	srand(time(0));

	clock_t start, end;
	double dur;
	double avtime1 = 0, avtime2 = 0, avtime3 = 0;
	bool flag = true;

	unsigned char output[33];
	unsigned char *seed[32];
	unsigned char *msg[securityLevel / 8];
	unsigned char *de_msg[securityLevel / 8];

	FILE *fp = NULL;

	fopen_s(&fp, "time.rsp", "w");

	for (int i = 0; i < securityLevel; i++)
	{
		((unsigned int *)m)[i] = rand() % 2;
	}

	start = clock();
	pke_keygen(pk, sk);
	end = clock();
	dur = (double)(end - start);
	fprintf(fp, "gen_time = %.3f\n", (dur / CLOCKS_PER_SEC));
	start = clock();
	pke_enc(pk, m, (unsigned long long)mm * nn, c, &clen, securityLevel);

	end = clock();
	dur = (double)(end - start);
	fprintf(fp, "enc_time = %.3f\n", (dur / CLOCKS_PER_SEC));
	start = clock();
	pke_dec(sk, c, clen, m2, &mlen, securityLevel);

	end = clock();
	dur = (double)(end - start);
	fprintf(fp, "dec_time = %.3f\n", (dur / CLOCKS_PER_SEC));
	printf("PlainText:");
	for (int i = 0; i < securityLevel; i++)
	{
		cout << ((unsigned int *)m)[i] << " ";
	}
	cout << endl;
	printf("DecryptedText:");
	for (int i = 0; i < securityLevel; i++)
	{
		cout << ((unsigned int *)m2)[i] << " ";
	}
	cout << endl;
	for (int i = 0; i < securityLevel; i++)
	{

		cout << ((unsigned int *)m2)[i] - ((unsigned int *)m)[i] << " ";
		if (!(((unsigned int *)m2)[i] == ((unsigned int *)m)[i]))
		{
			flag = false;
		}
	}
	if (flag)
	{
		printf("Success!\n");
	}
	else
	{
		printf("Failed!\n");
	}
	fprintf(fp, "is_success = ");
	fprintf(fp, "%d", flag);
	fprintf(fp, "\n");

	for (int i = 0; i < 8; i++)
		((unsigned int *)seed)[i] = ((unsigned int *)pk)[i];

	fprintf(fp, "seed = ");
	for (int i = 0; i < 32; i++)
	{
		fprintf(fp, "%02x", (((char *)seed)[i] & 0xff));
	}
	fprintf(fp, "\n");
	fprintf(fp, "mlen = %d\n", securityLevel);

	for (int i = 0; i < securityLevel / 8; i++)
		((char *)msg)[i] = 0x0;
	for (int i = 0; i < securityLevel; i++)
	{
		((char *)msg)[i / 8] = (*((char *)msg + i / 8) << 1) | (((unsigned int *)m)[i] & 0x1);
	}

	for (int i = 0; i < securityLevel / 8; i++)
		((char *)de_msg)[i] = 0x0;
	for (int i = 0; i < securityLevel; i++)
	{
		((char *)de_msg)[i / 8] = (*((char *)de_msg + i / 8) << 1) | (((unsigned int *)m2)[i] & 0x1);
	}

	fprintf(fp, "msg = ");
	for (int i = 0; i < securityLevel / 8; i++)
		fprintf(fp, "%02x", (((char *)msg)[i] & 0xff));
	fprintf(fp, "\n");

	fprintf(fp, "pk = ");
	for (int i = 0; i < PKE_PUBLICKEYBYTES; i++)
		fprintf(fp, "%02x", (((char *)pk)[i] & 0xff));
	fprintf(fp, "\n");

	fprintf(fp, "sk = ");
	for (int i = 0; i < PKE_SECRETKEYBYTES; i++)
		fprintf(fp, "%02x", (((char *)sk)[i] & 0xff));
	fprintf(fp, "\n");

	fprintf(fp, "clen = %d\n", PKE_BYTES);

	fprintf(fp, "c =  ");
	for (int i = 0; i < PKE_BYTES; i++)
		fprintf(fp, "%02x", (((char *)c)[i] & 0xff));
	fprintf(fp, "\n\n");

	fprintf(fp, "de_msg = ");
	for (int i = 0; i < securityLevel / 8; i++)
		fprintf(fp, "%02x", (((char *)de_msg)[i] & 0xff));
	fprintf(fp, "\n");

	fclose(fp);
}

void batchGenInstance(int type)
{
	changeParams(type);
	printf("Generate instance!\n");
	unsigned char *pk = new unsigned char[PKE_PUBLICKEYBYTES];
	unsigned char *sk = new unsigned char[PKE_SECRETKEYBYTES];
	unsigned char *m = new unsigned char[securityLevel * 4 * 4];
	unsigned char *m2 = new unsigned char[securityLevel * 4 * 4];
	unsigned char *c = new unsigned char[PKE_BYTES];
	unsigned long long clen, mlen;
	srand(time(0));

	clock_t start, end;
	double dur;
	double avtime1 = 0, avtime2 = 0, avtime3 = 0;
	bool flag = true;
	int N = 50, correct_count = 0;

	unsigned char output[33];
	unsigned char *seed[32];
	unsigned char *msg[securityLevel / 8];
	unsigned char *de_msg[securityLevel / 8];

	FILE *fp = NULL;

	fopen_s(&fp, "batch.rsp", "w");

	for (int i = 0; i < N; i++)
	{
		for (int i = 0; i < securityLevel; i++)
		{
			((unsigned int *)m)[i] = rand() % 2;
		}
		printf("count = %d\n", i + 1);
		fprintf(fp, "count = %d\n", i + 1);
		start = clock();
		pke_enc(pk, m, (unsigned long long)mm * nn, c, &clen, securityLevel);
		start = clock();
		pke_keygen(pk, sk);
		end = clock();
		dur = (double)(end - start);
		avtime1 += dur / CLOCKS_PER_SEC;
		fprintf(fp, "gen_time = %.3f\n", (dur / CLOCKS_PER_SEC));
		start = clock();
		pke_enc(pk, m, (unsigned long long)mm * nn, c, &clen, securityLevel);

		end = clock();
		dur = (double)(end - start);
		avtime2 += dur / CLOCKS_PER_SEC;
		fprintf(fp, "enc_time = %.3f\n", (dur / CLOCKS_PER_SEC));
		start = clock();
		pke_dec(sk, c, clen, m2, &mlen, securityLevel);

		end = clock();
		dur = (double)(end - start);
		avtime3 += dur / CLOCKS_PER_SEC;
		fprintf(fp, "dec_time = %.3f\n", (dur / CLOCKS_PER_SEC));

		for (int i = 0; i < securityLevel; i++)
		{

			cout << ((unsigned int *)m2)[i] - ((unsigned int *)m)[i] << " ";
			if (!(((unsigned int *)m2)[i] == ((unsigned int *)m)[i]))
			{
				flag = false;
			}
		}
		if (flag)
		{
			correct_count++;
			printf("Success!\n");
		}
		else
		{
			printf("Failed!\n");
		}
		fprintf(fp, "is_success = ");
		fprintf(fp, "%d", flag);
		fprintf(fp, "\n");
	}
	fprintf(fp, "ave_gen_time = ");
	fprintf(fp, "%.3f\n", avtime1 / N);
	fprintf(fp, "ave_enc_time = ");
	fprintf(fp, "%.3f\n", avtime2 / N);
	fprintf(fp, "ave_dec_time = ");
	fprintf(fp, "%.3f\n", avtime3 / N);
	fprintf(fp, "correct rate = ");
	fprintf(fp, "%.3f\n", double(correct_count) / N);
	fclose(fp);
}