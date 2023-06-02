<script>
  let shortLink = false;
  let shortLinkTarget = false;
  export let title = 'Schedule';
  let endpoint;
  async function getLink () {
    let target = window.location.href;
    if (target.indexOf('localhost')>-1) {
      target = target.replace(/http:\/\/localhost[^\/]*/,'https://iacs-schedule.netlify.app/');
    }
    if (shortLinkTarget==target) {
      console.log('Already got a link!');
    } else {
      shortLinkTarget = '';
      endpoint = `https://is.gd/create.php?format=xml&url=${encodeURIComponent(target)}`;
      //let response = await fetch(
      //  endpoint, {mode:'cors'}
      //);
      let xhr = new XMLHttpRequest()
      xhr.open('GET',endpoint);
      xhr.onreadystatechange = (ev)=>{
          console.log('Complete?',ev,xhr.responseText);
          shortLink = xhr.responseText;
        }
      
      xhr.send();
      /*let text = await response.text();
      console.log('got json',text);
      shortLink = text;
      shortLinkTarget = target;*/
    }
  }

</script>


{#if endpoint}
  <div class="box">
<button on:click={()=>endpoint=''}>&times;</button>
  <iframe src={endpoint}></iframe>
  </div>
{:else}
  <button on:click={getLink}>
    Get Short Link
  </button>
{/if}
<style>
  .box {
    width: 200px;
    position: relative;
  }
  .box button {
    position: absolute;
    right: 2px;
    top: 2px;
    border-radius: 50%;
    width: 2em;
    height: 2em;
  }
  .box iframe {
    border : 1px solid;
    padding: 1em;
    border-radius: 8px;
    width: 200px;
    height: 40px;
  }
  
</style>

