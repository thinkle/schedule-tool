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
      endpoint = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(target)}`;
      let response = await fetch(
        endpoint, {mode:'cors'}
      );
      let text = await response.text();
      console.log('got json',text);
      shortLink = text;
      shortLinkTarget = target;
    }
  }

</script>

<button on:click={getLink}>
  Get Link
</button>
{#if endpoint}<a href={endpoint} target="_BLANK">Try API directly?</a>{/if}
{#if shortLink}
  <a href="{shortLink}">{shortLink}</a>
{/if}
<style>
  
</style>

