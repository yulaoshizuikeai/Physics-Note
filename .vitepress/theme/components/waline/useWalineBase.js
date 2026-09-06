import { useRoute } from "vitepress";
import { computed } from "vue";

const serverURL = "";

export const useWalineBase = () => {
  const route = useRoute();
  const path = computed(() => route.path);

  return {
    serverURL,
    route,
    path,
  };
};
