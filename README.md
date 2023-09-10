# Minecraft自动打包（改版）
- ## 适用于Minecraft基岩版,能将行为包，资源包进行打包
- ## [原版地址](https://github.com/menghengbai/Minecarft-bedrock-mcpacks-auto-packing)
# 功能
  * 1.能自动将音乐打包（可以用来做音乐包）
  * 2.自动整合行为包，资源包
  * 3.自动整合文件夹内的音乐，并自动生成文件
  * 4.待开发（（
# 未来可能加入的功能
  * 1.没想好（（（
# 配置文件说明(config.json):
## 以下是默认配置:
```json
{
    "pack_name":"test",
    "title":"A Minecraft pack",
    "describe":"一个描述",
    "author":"somebody",
    "type":"RB",
    "uuid":{
        "header":"",
        "modules":[
            "",""
        ],
        "dependencies":""
    },
    "version":{
        "packv": [0,0,1],
        "minv": [1,16,0]
    }
}
```
* "pack_name"是你要打包的包名
* "title"是游戏中你的包的名字
* "describe"是游戏中包的描述
* "author"是作者名,"type"是包的类型(可以是RB，R，B)
* "uuid"这部分你可以填上自己想要的uuid，也可以把这部分删了来自动生成(((
* "version"中的"packv"是你的包的版本，"minv"是这个包最低能在哪个游戏版本上使用
# 文件夹说明：
- "./tmp/*"是临时文件夹，里面存放"tmp_R"和"tmp_B"；"/tmp_R"里是临时的资源包的文件（用于打包），"/tmp_B"是临时的行为包的文件
- 注意：请不要将文件放进"./tmp_R/B"中，否则你的文件将会被删除
- "./build"里是打包的包，根据配置文件来生成BP(行为包)，RP(资源包)，*_RB.mcaddon(整合了这两个的包)
- "./music"里放你要添加的音乐
# ask:什么时候更新呢qwq
A:等我放假（（（