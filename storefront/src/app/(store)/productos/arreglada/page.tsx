import { redirect } from "next/navigation";

export default function FormalCategoryPage() {
  redirect("/productos?categoria=arreglada");
}
