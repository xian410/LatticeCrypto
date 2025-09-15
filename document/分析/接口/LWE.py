from codecs import xmlcharrefreplace_errors
from itertools import filterfalse
from pyexpat.errors import messages
from sage.all import oo
from estimator import *
from estimator.lwe_dual import dual, dual_hybrid
load("sage/framework/est/NIST-est.sage")
from TwoStep_Cost_Simple_Model import two_step_simple_model
from rep0 import zuhe0
from rep3 import zuhe3
from rep4 import zuhe4
def choose_nd(n,q,m):
    # print("""
    # 三元分布SparseTernary:1
    # 二元分布SparseBinary:2
    # 中心二项分布CenteredBinomial:3
    # 离散高斯分布DiscreteGaussian：4
    # 均匀分布Uniform：5""")
    # c = int(input("请输入s的分布选择代号： "))
    x_s = 0
    x_e = 0
    # zh=True
    zh_sw=0


    zh=False
    std = float(input("标准差： "))
    mean = float(input("均值： "))
    x_s = ND.DiscreteGaussian(std,mean)
    D_s= build_Gaussian_law(std, q)

   
    zh=False
    std = float(input("标准差： "))
    mean = float(input("均值： "))
    x_e = ND.DiscreteGaussian(std, mean)
    D_e= build_Gaussian_law(std, q)

    return x_s, x_e, D_e, D_s, zh, zh_sw



n = int(input("n = "))
q = int(input("q = "))
m = int(input("m = "))
xs, xe, D_e, D_s, zh, zh_sw = choose_nd(n,q,m)

params = LWE.Parameters(n, q, xs, xe, m)

print("-----------------------------------")
print("""rop ：总复杂度
red ：约化复杂度
svp ：搜索复杂度
mem ：总内存
β   ：BKZ块大小
d   ：格维度
η   ：最终BDD的调用维度
δ   ：格基约化的根Hermite因子
ζ   ：猜的个数
|S| ：猜测搜索空间（与babai有关）
prob：猜成功的概率
↻   ：重复攻击的频率
m   ：实际使用的样本数量
h1  ：猜测坐标中非零分量的个数（如果秘密分布是稀疏的）
k   ：中间相遇的拆分维度""" )
print("-----------------------------------")

try:
    temp1 = LWE.primal_usvp(params,red_shape_model="gsa")
    print("原始攻击")
    print(temp1)
    print("-----------------------------------")
except Exception:
    pass

try:

    temp2 = dual(params)
    print("对偶攻击")
    print(temp2)
    print("-----------------------------------")
except Exception:
    pass

try:
    temp3 = NTRU.primal_hybrid(params, mitm=True, babai=True)
    print("混合原始")
    print(temp3)
    print("-----------------------------------")
except Exception:
    pass

try:

    temp4 = dual_hybrid(params, mitm_optimization=True, fft=False)
    print("混合对偶")
    print(temp4)
    print("-----------------------------------")
except Exception:
    pass

if zh:
    try:
        print("组合攻击")
        zuhe0(n,q,zh_sw)
        zuhe3(n,q,zh_sw)
        zuhe4(n,q,zh_sw)
        print("-----------------------------------")
    except Exception:
        pass


try:
    print("代数攻击")
    print(LWE.arora_gb(params))
    print("-----------------------------------")
except Exception:
    pass

try:
    dim_, dvol = initialize_from_LWE_instance(n, q, m, D_e, D_s, verbosity=True)
    print("[PKC:XMM24]:Two_step_estimator_MATZOV22")
    svp_estimate_attack(silent=False, method=2, parallel_=False, l=None, dvol=dvol, dim_=dim_, gen_GSA_gso=True,
                        print_l=False, ldc_param="AGPS20", cal_ee="chi", worst_case=False, goal_min_cost="gate_min",
                        cumG=False)
    print("-----------------------------------")
except Exception:
    pass

try:
    sigma = params.Xe.stddev
    print("[PKC:XMM24]:Two_step_estimator_simple")
    two_step_simple_model(n, q, m, sigma)
    print("-----------------------------------")
except Exception:
    pass