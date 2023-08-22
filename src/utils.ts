import * as yaml from "js-yaml"

function getFileNameWithoutExtension(filename: string) {
    var pattern = /\.[A-Za-z]+$/;
    let ansMatch = pattern.exec(filename);
    if (ansMatch !== null) {
        return filename.slice(0, ansMatch.index);
    } else {
        return filename;
    }
}
  
function debounce(context: any, fn = () => {}, delay: number = 1000) {
    let timeout: any = null;
    return function () {
        clearTimeout(timeout);
  
        timeout = setTimeout(() => {
            fn.apply(context, []);
        }, delay);
    };
}
  
function getMarkDownTitle(data: string = "") {
    const titleMatchReg = /#+\s[^#\n]+/g;
    let matchResult = data.match(titleMatchReg) || [];
    data = matchResult.join("\n");
  
    return data;
}

function loadYamlTitle(data: string = ""){
    try{
        const contents: any = yaml.load(data)
        const titles = Object.keys(contents).sort()
        const parsed = titles
                .map(title => "Root." + title)
                .map(title => title.replace(/[^.]+\./g, "#"))
                .map(title => title.replace(/(#+)([^#]+)/g, "$1 $2"))
                .join("\n")

        console.log(parsed)
        return parsed
    }catch(e){
        e
    }
}
  
export { getFileNameWithoutExtension, debounce, getMarkDownTitle, loadYamlTitle };
