/* eslint-disable max-len */
import * as yaml from "js-yaml"
import * as vscode from "vscode"
import * as path from "path"
import {EOL} from "os"

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

function loadYamlTitle(data: string = "", root: string = "Root."){
    try{
        const contents: any = yaml.load(data)
        const titles = Object.keys(contents).sort()
        const parsed = titles
            .flatMap(title => {
                if(contents[title].datatype && contents[title].unit){
                    return title + "(" + contents[title].unit + ")"
                }else{
                    return title
                }
            })
            //.flatMap(title => createFakeChildren(title, "allowed", "[enum]", contents))
            .flatMap(title => createFakeChildren(title, "instances", "[inst]", contents))
            .flatMap(title => title.replace(/[^.]+\./g, "  "))
            .flatMap(title => title.replace(/(\s*)([^\s]+$)/g, "$1- $2"))
            .join("\n")

        return parsed
    }catch(e){
        console.log(e)
    }
}

const createFakeChildren = (baseKey: string, childKey: string, fakeChildKey: string, data: any) => {
    if(data[baseKey] && data[baseKey][childKey]){
        if(data[baseKey][childKey].map){
            const inst = data[baseKey][childKey].map((elem: string) => baseKey + '.' + fakeChildKey +'.' + elem)
            return [baseKey, baseKey + '.' + fakeChildKey].concat(inst)
        }else{
            return [baseKey, baseKey + '.' + fakeChildKey + '.',  baseKey + '.' + fakeChildKey + '.' + data[baseKey][childKey]]
        }
    }else{
        return baseKey
    }
}

async function expandIncludes(data: string = "", currentDir: string = "", depth: number, root: string = ""){
    console.log(data)

    const regex = /^(?<whole>\s*#include\s+(?<file>[\w/]+\.vspec)(?:\s+(?<root>[\w.]+))?\s*)$/gm
    const originData = data
    const originRoot = root
    let include = regex.exec(data)
    const registeredPath: string = vscode.workspace.getConfiguration().get("vscode-vspec-tree-preview.include-path") || "spec"
    const newDepth = depth

    while(include?.groups && vscode.workspace.workspaceFolders){
        const file = vscode.Uri.joinPath(vscode.Uri.file(currentDir), include.groups.file)
        const newRoot = (include.groups.root ? include.groups.root + "." : "")
        const replacer = include.groups.whole.replace(/[\n\r]/g, "")
        
        let document
        try{
            document  = await vscode.workspace.openTextDocument(file)
        }catch(e){
            const includePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, registeredPath, include.groups.file)
            document = await vscode.workspace.openTextDocument(includePath)
        }
        let text = document.getText();
        if(newDepth > 0){
            text = await expandIncludes(text, path.dirname(file.fsPath), newDepth - 1, newRoot)
        }else{
            console.log("end")
        }
        const addRootPtn = /^([\w.]+:\s*)$/gm
        text = text.replace(addRootPtn, (newRoot + '$1'))
        const data2 = data.replace(replacer, text)
        data = data2
        include = regex.exec(originData)
    }
    return data
}
  
export { getFileNameWithoutExtension, debounce, getMarkDownTitle, loadYamlTitle, expandIncludes };
