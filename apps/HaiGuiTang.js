import plugin from '../../../lib/plugins/plugin.js'
import common from'../../../lib/common/common.js'
import console from 'console'
import axios from 'axios'
import fs from 'node:fs'
import YAML from 'yaml'
//此JS由JD(1461072722)编写
//模型的prompt文件请放到/Yunzai-Bot/plugins/WeLM-plugin/data/
//如果没有hgttd或者hgttm文件，请自行在/Yunzai-Bot/plugins/WeLM-plugin/data/内创建"hgttd.txt"或"hgttm.txt"文件。
//有报错先看这里！！！！！！可能需要cnpm/pnpm/npm install axios yaml fs后才能正常使用，看看简介有其他方式
//有问题问JD(1461072722)或者兰罗摩(脾气很差别问到高血压)(3584075812)JD在上学回复慢，但是一定会回复，也可以去火火的群(666345141)或者JD的群(815638467)里面找JD
//分割线_____________________________

export class RGznbot extends plugin {
    constructor() {
        super({
            name: 'WeLM海龟汤',
            event: 'message',
            priority: 6000,
            rule: [
                 {
                    reg: '^看汤面.*',
                    fnc: 'ktm',
                },
                {
                    reg: '^看汤底.*',
                    fnc: 'ktd',
                },
                {
                    reg: '(^请问.*)',
	                fnc: 'qw',
                },
				{
					reg: '^写汤面.*',
					fnc: 'xtm'
				},
				{
					reg: '^写汤底.*',
					fnc: 'xtd'
				}
            ]
        })
    }
    
    async qw(e) {
		if (e.xml || e.img) {
			return false;
		}
		const set = await YAML.parse(fs.readFileSync(`./plugins/WeLM-plugin/config/switch.yaml`,'utf8'));
		if (e.isGroup) {
			if (set.GroupSwitch === "off") {
				return false
			}
		}
		if (!e.isGroup) {
			if (set.PrivateSwitch === "off") {
				return false
			}
		}
		const _path = process.cwd()
		const settings = await YAML.parse(fs.readFileSync(`${_path}/plugins/WeLM-plugin/config/config.yaml`,'utf8'));
        //如需配置插件请到本插件文件夹内config的config.yaml进行编辑
        if (e.msg && e.msg?.indexOf("请问") >= 0 || !e.isGroup){
        e.msg = e.msg.replace(/#请问/g, "")
		let sc_cs = "阅读文章你只能回答“是”与“不是”，“相关”与“不相关”，如无法回答上述内容的话请回答“不知道，请重新提问”\n" + fs.readFileSync('./plugins/WeLM-plugin/data/hgttd.txt', { encoding: 'utf-8' }) + "\n:" + "问题:" + e.msg + "\n" + "回答" + ":"
        axios({
	        method: 'post',
	        url: 'https://welm.weixin.qq.com/v1/completions',
	        headers: {
		        "Content-Type": "application/json",
		        "Authorization": settings.APIToken
	        },
	        data: {
		        "prompt": sc_cs,
		        "model": settings.model,
		        "max_tokens": settings.max_tokens,
		        "temperature": settings.temperature,
		        "top_p": settings.top_p,
		        "top_k": settings.top_k,
		        "n": settings.n,
		        "stop": settings.stop,
	        }
        })
		.then(function (response) {
			logger.info('----------------WeLM调试----------------')
			logger.info('ID:' + response.data.id)
			logger.info('使用的类型:' + response.data.object)
			logger.info('使用的模型:' + response.data.model)
			logger.info('生成的文本:' + response.data.choices[0].text)
			logger.info('----------------------------------------')
			e.reply(settings.twreplystart + response.data.choices[0].text, e.isGroup)
		})        
		.catch(function (error) {
			logger.error('----------------WeLM出现错误----------------')
			logger.error('报错内容(经缩减): ' + error)
			logger.error('-------------------分隔符-------------------')
			logger.warn('以下为常规报错内容(如果报错内容不含有以下任何一种请提出issues至Github或Gitee, 或进群讨论): ')
			logger.warn('超时：504')
			logger.warn('服务不可用：503')
			logger.warn('用户prompt命中敏感词：400')
			logger.warn('生成结果命中敏感词：200')
			logger.warn('用户输入参数不合法：400')
			logger.warn('配额超限制：429')
			logger.warn('请求频率超限制：429')
			logger.warn('Token不可用：403')
			logger.error('-------------------------------------------')
		});
    }}
 
    async ktm(e) {
		if (e.xml || e.img) {
			return false;
		}
		let tm = fs.readFileSync('./plugins/WeLM-plugin/data/hgttm.txt', { encoding: 'utf-8' })
        e.reply(tm)
	}

	async ktd(e) {
		if (e.xml || e.img) {
			return false;
		}
		let td = fs.readFileSync('./plugins/WeLM-plugin/data/hgttd.txt', { encoding: 'utf-8' })
        e.reply(td)
		await common.sleep(500)
		fs.writeFileSync('./plugins/WeLM-plugin/data/hgttm.txt', "", 'utf8')
		fs.writeFileSync('./plugins/WeLM-plugin/data/hgttd.txt', "", 'utf8')
		e.reply("已清空汤底汤面，请重新填写再开始游戏")

	}
	
	async xtm(e) {
		if (e.xml || e.img) {
			return false;
		}
		e.msg = e.msg.replace(/写汤面/g, "")
		fs.writeFileSync('./plugins/WeLM-plugin/data/hgttm.txt', e.msg, 'utf8')
		e.reply("已写入汤面")
		await common.sleep(500)
		let td = fs.readFileSync('./plugins/WeLM-plugin/data/hgttd.txt', { encoding: 'utf-8' })
		if (td = "" ) {
			e.reply("检测到当前汤底为空，请确认已使用“写汤底”写入汤底")
			return true
		}
	}

	async xtd(e) {
		if (e.xml || e.img) {
			return false;
		}
		if (e.isGroup) {
			e.reply("请私聊填写，在这写你玩个蛋啊啊啊")
			return true;
		}
		e.msg = e.msg.replace(/写汤底/g, "")
		fs.writeFileSync('./plugins/WeLM-plugin/data/hgttd.txt', e.msg, 'utf8')
		e.reply("已写入汤底，请确认已经使用“写汤面”写入对应汤面后再开始游戏")
		await common.sleep(500)
		let tm = fs.readFileSync('./plugins/WeLM-plugin/data/hgttm.txt', { encoding: 'utf-8' })
		if (tm = "" ) {
			e.reply("检测到当前汤面为空，请确认已使用“写汤面”写入汤面")
			return true
		}
	}
}