const fs = require("fs")
const uuid = require("uuid")
const archiver = require('archiver');
const { count } = require("console");
console.log("原作者：苏打\n程序已经启动…")
let cfg = {
    "pack_name":"test",
    "title": "§b§l我的世界增量包§r",
    "describe": "§a§l这是一段默认的描述，如果你看到这些，证明你的配置文件没有写入正确§r",
    "author": "§c§l你没写作者吗？记得写§r",
    "type": "RB",//资源包R,行为包B,addons(RB)
    "uuid": {
        "header": uuid.v4(),
        "modules": [
            uuid.v4(), uuid.v4()
        ],
        "dependencies": uuid.v4()
    },
    version: {
        "packv": [0,0,1],
        "minv": [1,16,0]
    }
}

let testuuid = [cfg.uuid.header,cfg.uuid.modules[0],cfg.uuid.modules[1],cfg.uuid.dependencies]
for (let i=0; i<testuuid.length; i++) {
    for (let j=i+1; j<testuuid.length; j++) {
        if(testuuid[i]==testuuid[j]) {
            console.log("默认uuid生成了相同的uuid。\n欧皇，请保存你的结果，并在稍后重新运行本程序！\n")
            console.log(cfg)
            try {
                fs.writeFileSync("cfg.txt",{ flag: 'a+' },JSON.stringify(cfg,null,4))
                console.log("结果已输出到文件cfg.txt")
            }catch(err){
                if(err){
                    console.log("文件输出失败！请及时保存结果！")
                    return 1
                }
            }
            return 0
        }
    }
}
delete testuuid
console.log("现在，开始读取配置文件…")
let data
try {
    data = fs.readFileSync("config.json")
    data = JSON.parse(data)
    cfg = Object.assign(cfg,data)
}catch(err){
    if(err && err.code === 'ENOENT') {
        console.log("没有找到配置文件，已自动生成")
        const text = '{\n\t\n}';
        fs.writeFile('./config.json',text,{ flag: 'a+' },err => {if (err) {console.log("写入失败"+err)}});
        return 0
    }else{
        console.log("读取配置文件失败\n\t详细内容:\n"+err)
        return 2
    }
}
console.log("读取配置文件完成，开始校验uuid…")
let uugo = false
if (!uuid.validate(cfg.uuid.header)){
    uugo = true
    console.log("header部分uuid不合格！")
}
if (!(uuid.validate(cfg.uuid.modules[0])&&uuid.validate(cfg.uuid.modules[1]))){
    uugo = true
    console.log("modules部分uuid不合格！")
}
if (!uuid.validate(cfg.uuid.dependencies)){
    uugo = true
    console.log("dependencies部分uuid不合格！")
}
if(uugo) {
    return 3
}else{
console.log("uuid校验通过！")
}
delete uugo
console.log("读取配置的包类型…")
const manifest = {
  "format_version": 2,
  "header": {
      "name": cfg.title,
      "description": `${cfg.describe}\n\nThis package was made by ${cfg.author} and packaged using auto package tool`,
      "uuid": cfg.uuid.header,
      "version": cfg.version.packv,
      "min_engine_version": cfg.version.minv
  },
  "modules":
    [
      {
        "description": `${cfg.describe}\n\nThis package was made by ${cfg.author} and packaged using auto package tool`,
          "type": null,
          "uuid": cfg.uuid.modules[0],
          "version": cfg.version.packv
      }
    ],
  "dependencies": [
    {
     "uuid":cfg.uuid.dependencies,
      "version": cfg.version.packv
    }
 ]
}
let R = JSON.parse(JSON.stringify(manifest))
let B = JSON.parse(JSON.stringify(manifest))
B.modules[0].uuid = cfg.uuid.modules[1]
if(cfg.type=="RB"){
    console.log("这是一个合并包，已调整至合并包处理逻辑")
    R.modules[0].type = "resources"
    B.modules[0].type = "data"
    let tmp = B.dependencies[0].uuid
    B.dependencies[0].uuid = B.header.uuid
    B.header.uuid = tmp
}else if(cfg.type=="R"){
    console.log("这是一个资源包，已调整至资源包处理逻辑")
    delete B
    R.modules[0].type = "resources"
}else if(cfg.type=="B"){
    console.log("这是一个行为包，已调整至行为包处理逻辑")
    delete R
    B.modules[0].type = "data"
}else{
    console.log("读取包类型错误，请指定正确的包类型。它只能是R，B，RB。")
    return 4
}

//检查必备文件夹
if(!fs.existsSync('./music')){fs.mkdir('music',err=>{if(err){console.log(err)}})}
if(!fs.existsSync('./tmp/tmp_R/sounds/bgm')){fs.mkdir('./tmp/tmp_R/sounds/bgm',err=>{if(err){console.log(err)}})}
if(!fs.existsSync('./build')){fs.mkdir('build',err=>{if(err){console.log(err)}})}

function musd(dir) {
    let list = fs.readdirSync("tmp/tmp_R/sounds/"+dir)
    let ret = ""
    for (i in list) {
        if(!fs.statSync('tmp/tmp_R/sounds/'+dir+"/"+list[i]).isFile()) {
            ret += musd(dir+"/"+list[i])
        }else{
            ret += `"${dir}/${list[i].slice(0,-4)}":{"category":"music","sounds":[{"name":"sounds/${dir}/${list[i].slice(0,-4)}","stream":true,"volume":1,"load_on_low_memory":true}]},`
        }
    }
    return ret
}

if (cfg.type=="RB"||cfg.type=="R") {
    console.log("所选的类型中包含资源包，音频文件json生成…")
    let list = fs.readdirSync("music/")
    for (Copy in list) {
        //将music文件里的文件复制到资源包中
        fs.copyFileSync(`./music/${list[Copy]}`,`./tmp/tmp_R/sounds/bgm/${list[Copy]}`,0,err=>{if(err){console.log(err)}})
    }
    try{
        let f = ""
        let pack_list = fs.readdirSync("tmp/tmp_R/sounds/")
        for(i in pack_list){
            if (!fs.statSync(`tmp/tmp_R/sounds/${pack_list[i]}`).isFile()){
                f += musd(pack_list[i])
            }
        }
        f = f.slice(0,-1)
        f = "{"+f+"}"
        f = JSON.parse(f)
        fs.writeFileSync('./tmp/tmp_R/sounds/sound_definitions.json', JSON.stringify(f,null,4))
        console.log("音频定义文件写入完成")
        delete list
        delete f
    }catch(err){
        console.log("音乐部分文件生成异常（程序继续执行）："+err)
        delete list
        delete f
    }
}
console.log("生成manifest文件…")
try {
    if(cfg.type == "RB" || cfg.type == "R"){
        fs.writeFileSync('./tmp/tmp_R/manifest.json', JSON.stringify(R, null, 4))
    }
    if(cfg.type =="RB" || cfg.type == "B"){
        fs.writeFileSync('./tmp/tmp_B/manifest.json', JSON.stringify(B, null, 4))
    }
    console.log("写入manifest完成")
}catch(err){
    if (err) {
        console.log("写入manifest失败："+err)
        return 5
    }
}

const archive = archiver('zip',{zlib: {level: 3}});

if(cfg.type == "RB"){
    const RBP_output = fs.createWriteStream(__dirname+`/build/${cfg.pack_name}_RB.mcaddon`);
    archive.on('error',function(err){
        throw err;
    });
    archive.pipe(RBP_output);
    archive.directory('./tmp/tmp_R/',`${cfg.pack_name}_R`);
    archive.directory('./tmp/tmp_B/',`${cfg.pack_name}_B`);
    archive.finalize();
}else if(cfg.type == "R"){
    const RP_output = fs.createWriteStream(__dirname + `/build/${cfg.pack_name}_R.mcpack`);
    archive.on('error',function(err){
        throw err;
    });
    archive.pipe(RP_output);
    archive.directory('./tmp/tmp_R/',false);
    archive.finalize();
}else if (cfg.type == "B"){
    const BP_output = fs.createWriteStream(__dirname+`/build/${cfg.pack_name}_B.mcpack`);
    archive.on('error',function(err){
        throw err;
    });
    archive.pipe(BP_output);
    archive.directory('./tmp/tmp_B/',false);
    archive.finalize();
}

console.log("打包完成！")
//防止没压缩玩就删了
setTimeout(rawflie,1500,'funky')
function rawflie(){
    console.log("正在清理缓存...")
    let music_file =fs.readdirSync("tmp/tmp_R/sounds/bgm/")
    for(i in music_file){
        fs.unlink(`tmp/tmp_R/sounds/bgm/${music_file[i]}`,err=>{if(err){console.log(err)}});
    }
    console.log("缓存清理完成")
}
