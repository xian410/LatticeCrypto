import matplotlib.pyplot as plt

count_list = []
gen_time_list = []
enc_time_list = []
dec_time_list = []

with open('batch.rsp', 'r') as file:
    for line in file.readlines():
        if line.startswith('count'):
            count_list.append(int(line.split('=')[1].strip()))
        elif line.startswith('gen_time'):
            gen_time_list.append(float(line.split('=')[1].strip()))
        elif line.startswith('enc_time'):
            enc_time_list.append(float(line.split('=')[1].strip()))
        elif line.startswith('dec_time'):
            dec_time_list.append(float(line.split('=')[1].strip()))

     

plt.plot(count_list, gen_time_list, label='gen_time')
plt.plot(count_list, enc_time_list, label='enc_time')
plt.plot(count_list, dec_time_list, label='dec_time')
plt.xlabel('count')
plt.ylabel('Time')
plt.title('Time vs Count')
plt.legend()
plt.show()