import { redirect } from "next/navigation";

export default function SportCategoryPage() {
  redirect("/productos?categoria=deporte");
}
