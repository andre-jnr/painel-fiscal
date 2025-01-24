function copiarTextoSarkis() {
    var txtSarkis = document.getElementById("txt-sarkis");

    txtSarkis.select();
    txtSarkis.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-sarkis");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}

function copiarTextoNFDevolucao() {
    var txtDev = document.getElementById("txt-dev");

    txtDev.select();
    txtDev.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-nf-dev");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}

function copiarTextoReanalise5() {
    var txtReanalise5 = document.getElementById("txt-reanalise5");

    txtReanalise5.select();
    txtReanalise5.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-reanalise5");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}

function copiarTextoReanalise5Resumido() {
    var txtReanalise5 = document.getElementById("txt-reanalise5-resumido");

    txtReanalise5.select();
    txtReanalise5.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-reanalise5-resumido");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}

function copiarSelect() {
    var txtSelect = document.getElementById("txt-select");

    txtSelect.select();
    txtSelect.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-select");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}

function copiarInsert() {
    var txtInsert = document.getElementById("txt-insert");

    txtInsert.select();
    txtInsert.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-insert");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}

function copiarUpdate() {
    var txtUpdate = document.getElementById("txt-update");

    txtUpdate.select();
    txtUpdate.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-update");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}

function copiarDelete() {
    var txtDelete = document.getElementById("txt-delete");

    txtDelete.select();
    txtDelete.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem-delete");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}