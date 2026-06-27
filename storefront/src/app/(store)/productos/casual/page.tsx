import { redirect } from "next/navigation";

export default function CasualCategoryPage() {
  redirect("/productos?categoria=casual");
}
