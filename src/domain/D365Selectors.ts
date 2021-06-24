export const D365Selectors = {
    Login: {
        userName: "#i0116",
        password: "#i0118",
        otp: "#idTxtBx_SAOTCC_OTC",
        dontRememberLogin: "#idBtn_Back"
    },
    PopUp: {
        cancel: "#cancelButton",
        confirm: "#confirmButton"
    },
    DuplicateDetection: {
        ignore: 'button[data-id="ignore_save"]',
        abort: 'button[data-id="close_dialog"]'
    },
    Grid: {
        DataRowWithIndexCheckBox: "div[wj-part='root'] > div[wj-part='cells'] > div.wj-row[aria-rowindex='{0}'] > div.wj-cell.data-selectable"
    }
};