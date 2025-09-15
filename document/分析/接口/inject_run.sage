#!/usr/bin/env sage

import sys, builtins, os, contextlib


if len(sys.argv) < 2:
    print('用法：sage inject_run.sage your.py  arg1  arg2  ...')
    sys.exit(1)

py_file = sys.argv[1]         
args    = sys.argv[2:]        
if not os.path.isfile(py_file):
    print('文件不存在:', py_file)
    sys.exit(1)


class FakeInput:
    def __init__(self, lst):
        self.lst = lst
        self.idx = 0
    def __call__(self, prompt=''):
        if self.idx >= len(self.lst):
            raise SystemExit('错误：参数不够，还需要 %d 个值' % (self.idx - len(self.lst) + 1))
        val = self.lst[self.idx]
        self.idx += 1
        # 为了调试可见，把 prompt 和实际值打印出来
        # print(prompt, val, sep='')
        line=prompt+val+'\n'
        # with open('output.txt', 'a', encoding='utf-8') as f:
        logfile.write(line)
            # f.write('\n'.join(prompt,val))
        return val

builtins.input = FakeInput(args)


print('------ 开始执行 %s ------' % py_file)
# sys.stdout = open('output.txt', 'a', encoding='utf-8')
# runpy.run_path(py_file, run_name='__main__')
# sys.stdout.close()

logfile = open('output.txt', 'a', encoding='utf-8')  
old_stdout = sys.stdout                                   # 留柄，方便后面恢复
sys.stdout = logfile 
load(py_file) 
sys.stdout = old_stdout                                   # 恢复
logfile.close()       
print('------ 完成 ------')