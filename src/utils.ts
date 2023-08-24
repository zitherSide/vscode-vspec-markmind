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
            .map(title => root + title)
            .map(title => title.replace(/[^.]+\./g, "#"))
            .map(title => title.replace(/(#+)([^#]+)/g, "$1 $2"))
            .join("\n")

        return parsed
    }catch(e){
        console.log(e)
    }
}

async function expandIncludes(data: string = "", currentDir: string = "", depth: number, root: string = ""){
    const regex = /^\s*#include\s+(?<file>[\w/]+\.vspec)(?:\s+(?<root>[\w.]+))?\s*$/gm
    const originData = data
    const originRoot = root
    let include = regex.exec(data)
    
    while(include?.groups && vscode.workspace.workspaceFolders){
        const file = vscode.Uri.joinPath(vscode.Uri.file(currentDir), include.groups.file)
        const newRoot = (include.groups.root ? include.groups.root + "." : "")
        const replacer = include[0]
        
        let document
        try{
            document  = await vscode.workspace.openTextDocument(file)
        }catch(e){
            const includePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "spec", include.groups.file)
            document = await vscode.workspace.openTextDocument(includePath)
        }
        let text = document.getText();
        if(depth > 0){
            text = await expandIncludes(text, path.dirname(file.fsPath), depth - 1, newRoot)
        }
        const addRootPtn = /^([\w.]+:\s*)$/gm
        text = text.replace(addRootPtn, (newRoot + '$1'))
        const data2 = data.replace(replacer, text + EOL)
        data = data2
        include = regex.exec(originData)
    }
    return data
}
  
export { getFileNameWithoutExtension, debounce, getMarkDownTitle, loadYamlTitle, expandIncludes };
