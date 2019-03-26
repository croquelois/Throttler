
function sendCompute(){
  return new Promise(function(resolve, reject){
    $.ajax({
      type: "POST", 
      url: "/compute",
    }).done(resolve)
      .fail(reject);
  });
}

function sendRetrieve(id){
  return new Promise(function(resolve, reject){
    $.ajax({
      type: "GET", 
      url: "/compute/"+id,
    }).done(resolve)
      .fail(reject);
  });
}

async function poll(id){
  while(true){
    let res = await sendRetrieve(id);
    console.log(res);
    if(res.status != "ongoing")
      return res;
    await sleep(1000);
  }
}

async function SendAndPoll(onStatusChange){
  onStatusChange("sent");
  let res = await sendCompute();
  onStatusChange("ongoing");
  res = await poll(res.id);
  onStatusChange("completed");
  return res.data;
}

$(() => {
  let throttler = new Throttler(4,{nb:5,time:10000},SendAndPoll);
  
  $("#send").click(() => {
    let response = $("<div>").addClass("notification is-warning box");
    response.text("wait");
    function onStatusChange(status){
      if(status == "sent" || status == "ongoing")
        return response.removeClass("is-warning").addClass("is-info").text(status);
    }
    throttler.send(onStatusChange)
      .then(res => response.text(res.toFixed(0)).removeClass("is-warning is-info").addClass("is-success"))
      .catch(err => response.text(err && err.statusText).removeClass("is-warning is-info").addClass("is-danger"));
    $("#responses").append($("<div>").addClass("column is-1").append(response));
  });
});