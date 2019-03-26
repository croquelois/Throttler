function sleep(time){
  return new Promise(resolve => setTimeout(() => resolve(),time));
}

class Throttler {
  constructor(nb, rate, send){
    this.rate = rate;
    this.nb = nb;
    this.cur = 0;
    this.curRate = 0;
    this.realSend = send;
    this.queued = [];
    this.waitListener = [];
  }
  wait(){
    if(this.cur < this.nb)
      return Promise.resolve();
    return new Promise((resolve,reject) => this.waitListener.push(resolve));
  }
  send(){
    let p = new Promise((resolve,reject) => this.queued.push({arguments,resolve,reject}));
    this.consume();
    return p;
  }
  decreaseRate(){
    this.curRate--;
    this.consume();
  }
  async consume(){
    if(this.cur >= this.nb)
      return;
    if(this.curRate >= this.rate.nb)
      return;
    if(this.queued.length < (this.nb-this.cur)){
      let waitListener = this.waitListener;
      this.waitListener = [];
      waitListener.forEach(resolve => resolve());
    }
    if(!this.queued.length)
      return;
    this.cur++;
    this.curRate++;
    sleep(this.rate.time).then(() => this.decreaseRate());
    let item = this.queued.shift();
    try {
      let res = await this.realSend(...item.arguments);
      item.resolve(res);
    }catch(err){
      item.reject(err);
    }
    this.cur--;
    this.consume();
  }
}