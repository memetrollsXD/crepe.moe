<script lang="ts">
    function upload() {
        const file = document.querySelector<HTMLInputElement>('#fileInput')!.files![0];
        
    }
</script>

<input type="file" name="file" id="fileInput" />
<button on:click={upload}>Upload</button>
