#include <iostream>
#include <sstream>
#include <cstring>
#include "json.hpp"
#include "pke.h"
#include "httplib.h"
using namespace std;

string trim_leading_spaces(const string &str);

void handle_instance(const httplib::Request &req, httplib::Response &res)
{
    int type = stoi(req.get_param_value("security").c_str());
    printf("security: %d\n", type);
    genInstance(type);
    ifstream file("time.rsp"); // 打开文件

    if (!file.is_open())
    {
        cerr << "无法打开文件" << endl;
        return;
    }

    string line;
    string seed, mlen, msg, pk, sk, clen, c, gen_time, enc_time, dec_time, is_success, de_msg;

    while (getline(file, line))
    {
        istringstream iss(line);
        string key, value;
        if (getline(iss, key, '='))
        {
            if (key == "seed ")
            {
                getline(iss, seed);
            }
            else if (key == "mlen ")
            {
                getline(iss, mlen);
            }
            else if (key == "msg ")
            {
                getline(iss, msg);
            }
            else if (key == "pk ")
            {
                getline(iss, pk);
            }
            else if (key == "sk ")
            {
                getline(iss, sk);
            }
            else if (key == "clen ")
            {
                getline(iss, clen);
            }
            else if (key == "c ")
            {
                getline(iss, c);
            }
            else if (key == "gen_time ")
            {
                getline(iss, gen_time);
            }
            else if (key == "enc_time ")
            {
                getline(iss, enc_time);
            }
            else if (key == "dec_time ")
            {
                getline(iss, dec_time);
            }
            else if (key == "is_success ")
            {
                getline(iss, is_success);
            }
            else if (key == "de_msg ")
            {
                getline(iss, de_msg);
            }
        }
    }
    nlohmann::json jsonData;
    jsonData["seed"] = trim_leading_spaces(seed);
    jsonData["mlen"] = trim_leading_spaces(mlen);
    jsonData["msg"] = trim_leading_spaces(msg);
    jsonData["pk"] = trim_leading_spaces(pk);
    jsonData["sk"] = trim_leading_spaces(sk);
    jsonData["clen"] = trim_leading_spaces(clen);
    jsonData["c"] = trim_leading_spaces(c);
    jsonData["gen_time"] = trim_leading_spaces(gen_time);
    jsonData["enc_time"] = trim_leading_spaces(enc_time);
    jsonData["dec_time"] = trim_leading_spaces(dec_time);
    jsonData["is_success"] = trim_leading_spaces(is_success);
    jsonData["de_msg"] = trim_leading_spaces(de_msg);
    res.set_content(jsonData.dump(), "application/json");
}

void handle_batchGenInstance(const httplib::Request &req, httplib::Response &res)
{
    int type = stoi(req.get_param_value("security").c_str());
    printf("security: %d\n", type);
    batchGenInstance(type);
    // 读取本地文件内容
    ifstream file("batch.rsp", ios::in | ios::binary);
    if (file.is_open())
    {
        ostringstream ss;
        ss << file.rdbuf();
        string file_content = ss.str();

        // 设置响应内容为文件内容
        res.set_content(file_content, "application/octet-stream");

        // 设置响应头，指定为下载文件
        res.set_header("Content-Disposition", "attachment; filename=batch.rsp");

        file.close();
    }
    else
    {
        res.status = 404; // 文件未找到
    }
}

int main()
{
    // 创建服务器对象
    httplib::Server svr;
    svr.set_default_headers({{"Access-Control-Allow-Origin", "*"},
                             {"Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE"},
                             {"Access-Control-Max-Age", "3600"},
                             {"Access-Control-Allow-Headers", "*"},
                             {"Content-Type", "application/json;charset=utf-8"}});
    // 定义处理逻辑
    svr.Get("/genInstance", handle_instance);
    svr.Get("/batchGenInstance", handle_batchGenInstance);

    cout << "Server listening on http://localhost:8080" << endl;
    svr.listen("localhost", 8080);

    return 0;
}
string trim_leading_spaces(const string &str)
{
    size_t startpos = str.find_first_not_of(" \t"); // 找到第一个不是空格或制表符的字符位置
    if (string::npos != startpos)
    {
        return str.substr(startpos); // 返回从该位置到字符串末尾的子串
    }
    else
    {
        return ""; // 如果字符串全是空格或为空，则返回空字符串
    }
}
