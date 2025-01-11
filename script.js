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

function copiarTextoNFDevolucao() {
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

function copiarTextoNFDevolucao() {
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