from estimator import *
from estimator.sis_lattice import SISLattice
from sage.all import oo


n = int(input("n = "))
m = int(input("m(o为不输入) = "))
q = int(input("q = "))
length_bound = int(input("范数限制 = "))
if m==0:
    m=None
print("-----------------------------------")
print("""rop ：总复杂度
red ：约化复杂度
sieve:筛法复杂度
β   ：BKZ块大小
η   ：筛法调用维度
d   ：格维度
ζ   ：猜的个数
prob:成功概率
↻   ：重复攻击的频率
""" )
print("-----------------------------------")

print("与三十所结果相似的")
print(SIS.lattice(SIS.Parameters(n=n, q=q,m=m, length_bound=length_bound, norm=oo), red_cost_model = RC.MATZOV))   
print("-----------------------------------")