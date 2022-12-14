
function fetchDocs() {
  const Http = new XMLHttpRequest();
  const url='./allDocs';
  Http.open("GET", url);
  Http.send();
  
  Http.onreadystatechange = (e) => {
    let objArrStr = Http.response;
    let objArr = JSON.parse(objArrStr);
    
    let text = "<table>";

    objArr.forEach((docItem)=>{
      let attachmentName;
      if(docItem.doc._attachments) {
        let attachments = Object.keys(docItem.doc._attachments);
        attachmentName = attachments[0];
        text += "<tr><td><a target='_blank' href='/getdoc/"+attachmentName+"/"+docItem.id+"' >"+attachmentName+"</a></td>";
        let thisDelText = "<td><img src='trashcan.png' style='width:30px;margin-left:20px;' onClick=\"deleteAttachement(\'"+attachmentName+"/"+docItem.id+"\')\""+"/></td></tr>";
        text += thisDelText;
        } 
    });
    text += "</table>";
    
    document.getElementById("existing_content").innerHTML = text;
  }}

  function deleteAttachement(url) {
    const Http = new XMLHttpRequest();
    Http.open("POST", "./delete/"+url);
    Http.send();
    Http.onreadystatechange = (e) => {
      let objArrStr = Http.response;
      window.location.reload();
    }
  }
