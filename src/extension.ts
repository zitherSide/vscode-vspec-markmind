import * as vscode from "vscode";
import { MindMapPreview } from "./mindMapPreviewWebview";
import { writeToClipBoard } from "./writeToClipBoard";

export function activate(context: vscode.ExtensionContext) {
    let mindMapPreview: MindMapPreview;
    context.subscriptions.push(
        vscode.commands.registerCommand("vspctr.showVspecTree", () => {
            if ((mindMapPreview === undefined) || mindMapPreview.isDisposed) {
                mindMapPreview = new MindMapPreview(context);
            }
            mindMapPreview.updatePreview();
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("vspctr.exportSvg", () => {
            if ((mindMapPreview === undefined) || mindMapPreview.isDisposed) {
                vscode.window.showWarningMessage(
                    "Sorry, you need open the preview tab first.");
                return;
            }
            mindMapPreview.exportSvg();
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("vspctr.showVspecTreeFromFile", () => {
            if (mindMapPreview === undefined || mindMapPreview.isDisposed) {
                mindMapPreview = new MindMapPreview(context);
            }
            mindMapPreview.updatePreview(true);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("vspctr.copyTitle", writeToClipBoard)
    );
}

export function deactivate() {}
