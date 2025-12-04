export default async function AdminPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== "megahack785@gmail.com") {
    redirect("/dashboard")
  }

  // ...rest of the component
}
