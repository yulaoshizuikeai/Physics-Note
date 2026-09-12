<!-- 参考自 https://notes.linho.cc/s?q=adaf352048 -->

<script setup lang="ts">
import axios from "axios";
import { useRouter, withBase } from "vitepress";
import { onMounted } from "vue";
const router = useRouter();
onMounted(() => {
  const id = new URLSearchParams(window.location.search).get("q");
  if (!id || !/^[a-f0-9]{10}$/i.test(id)) return router.go(`/404`);
  axios.get(withBase("/shortmap.json")).then(
    (res) =>
      res.data[id] !== undefined ? router.go(`/${encodeURI(res.data[id])}`) : router.go(`/404`),
    () => router.go(`/404`),
  );
});
</script>
