import { ReportData } from "./ReportData"
import { config } from "../../config";

export namespace ReportParser {

    export const parse = function (report, isFalseReport?: boolean) {
        if (config.FIGHT_REPORT_SAVE_FILE) {
            ReportParser.saveForWebBrowser(report, "fightReprot-" + new Date().toLocaleString());
        }
        let reportData = new ReportData();
        reportData.setReport(report, isFalseReport);
        return reportData;
    }


    export let saveForWebBrowser = function (json: any, FileName: string) {
        let JsonString = JSON.stringify(json, null, 1);
        if (cc.sys.isBrowser) {
            let textFileAsBlob = new Blob([JsonString]);
            let downloadLink = document.createElement("a");
            downloadLink.download = FileName;
            downloadLink.innerHTML = "Download File";
            if (window.URL != null) {
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            }
            else {
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = () => {
                    document.body.removeChild(downloadLink);
                };
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
    }
}