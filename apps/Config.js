/*
   Copyright (c) 2023 书辞千楪
   WeLM-plugin is licensed under Mulan PSL v2.
   You can use this software according to the terms and conditions of the Mulan PSL v2. 
   You may obtain a copy of Mulan PSL v2 at:
            http://license.coscl.org.cn/MulanPSL2 
   THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
   See the Mulan PSL v2 for more details.  
*/

import plugin from '../../../lib/plugins/plugin.js'
import fs from 'node:fs'
import YAML from 'yaml'
import axios from 'axios'
//此插件由JD(1461072722)编写
//有报错先看这里！！！！！！可能需要cnpm/pnpm/npm install axios yaml fs后才能正常使用，看看简介有其他方式
//有问题问JD(1461072722)或者兰罗摩(脾气很差别问到高血压)(3584075812)JD在上学回复慢，但是一定会回复，也可以去火火的群(666345141)或者JD的群(815638467)里面找JD
//PS:感谢鸢(2166683295)大佬提供的写入yaml部分
//分割线_____________________________

const _path = process.cwd()


export class config extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'WeLM配置更改',
      /** 功能描述 */
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 500,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^#填写token(.*)$",
          /** 执行方法 */
          fnc: 'Token',
          permission: "master"
        },
        {
          reg: "^#更改name(.*)$",
          /** 执行方法 */
          fnc: 'Name',
          permission: "master"
        },
        {
          reg: "^#我的token",
          fnc: 'MyToken',
          permission: "master"

        },
        {
          reg: "#?welm设置(私聊|群聊)(开启|关闭)",
          fnc: 'Switch',
          permission: "master"
        }
      ]
    })
  }

  async Name(e) {
    if (!e.isMaster) {
      e.reply("JD:要是给你填了那我岂不是很没面子")
      return true
    }
    let name = e.msg.replace(/#更改name/g, "").trim();
    let str = fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`, "utf8")
    var reg = new RegExp(`BotName: "(.*?)"`);
    var Botname = str.replace(reg, `BotName: "${name}"`);
    fs.writeFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`, Botname, "utf8");
    logger.info('------------Name更改成功------------')
    e.reply(`名字已成功修改为${name}`)
    logger.info('-----------------------------------')
  }

  async Token(e) {
    if (e.isGroup) {
      e.reply("JD:要是给你在这填了那我岂不是很没面子")
      return true
    }

    let token = e.msg.replace(/#填写token/g, "").trim()
    let str = fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`, "utf8")
    var reg = new RegExp(`APIToken: "(.*?)"`);
    var api = str.replace(reg, `APIToken: "${token}"`);
    e.reply("开始测试Token正确性")
    axios({
      method: 'post',
      url: 'https://welm.weixin.qq.com/v1/completions',
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      data: {
        "prompt": "测试",
        "model": "xl",
        "max_tokens": "64",
        "temperature": "0.85",
        "top_p": "0.95",
        "top_k": "50",
        "n": "2",
        "stop": "\n",
      }
    })
      .then(function (response) {
        logger.info('------------API-Token填写/更改成功------------')
        logger.info(`Token已更改为:"${token}"`)
        logger.info('--------------------------------------------')
        fs.writeFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`, api, "utf8")
        e.reply("Token填写/更改成功")
      })
      .catch(function (error) {
        logger.error('----------------WeLM出现错误----------------')
        logger.error(`此Token(${token})不可用或无法访问WeLM, 报错内容(经缩减): ` + error)
        logger.error('-------------------分隔符-------------------')
        logger.warn('以下为常规报错内容(如果报错内容不含有以下任何一种请提出issues至Github或Gitee, 或进群讨论): ')
        logger.warn('服务不可用：503')
        logger.warn('超时：504')
        logger.warn('Token不可用：403')
        logger.error('-------------------------------------------')
        e.reply('Token不可用或无法访问welm，请检查Token或网络')
      });
  }

  async MyToken(e) {
    if (e.isGroup) {
      e.reply("兰罗摩:要是给你在群里看了,那我岂不是很没面子")
      return true
    }
    const settings = await YAML.parse(fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`, 'utf8'))
    e.reply(`报告主人,目前Token为: "${settings.APIToken}"`)
  }


  async Switch(e) {
    if (!e.isMaster) {
      return false
    }
    if (e.msg.includes('私聊')) {
      if (e.msg.includes('开启')) {
        let str = fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, "utf8")
        var reg = new RegExp(`PrivateSwitch: "(.*?)"`);
        var Switch = str.replace(reg, `PrivateSwitch: "on"`);
        fs.writeFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, Switch, "utf8");
        e.reply("私聊WeLM已设为开启")
        return true
      } else {
        let str = fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, "utf8")
        var reg = new RegExp(`PrivateSwitch: "(.*?)"`);
        var Switch = str.replace(reg, `PrivateSwitch: "off"`);
        fs.writeFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, Switch, "utf8");
        e.reply("私聊Welm已设为关闭")
        return true
      }
    }
    if (e.msg.includes('群聊')) {
      if (e.msg.includes('开启')) {
        let str = fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, "utf8")
        var reg = new RegExp(`GroupSwitch: "(.*?)"`);
        var Switch = str.replace(reg, `GroupSwitch: "on"`);
        fs.writeFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, Switch, "utf8");
        e.reply("群聊WeLM对话已设为开启")
        return true
      } else {
        let str = fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, "utf8")
        var reg = new RegExp(`GroupSwitch: "(.*?)"`);
        var Switch = str.replace(reg, `GroupSwitch: "off"`);
        fs.writeFileSync(`${_path}/plugins/WeLM-plugin/config/switch.yaml`, Switch, "utf8");
        e.reply("群聊WeLM对话已设为关闭")
        return true
      }
    }
  }
}