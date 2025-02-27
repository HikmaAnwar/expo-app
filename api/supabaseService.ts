import supabase from "@/utils/supabaseClient";

export const fetchQuestions = async () => {
  const { data, error } = await supabase.from("game").select("*").order("id");
  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
  return data;
};

export const fetchUserScores = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("user")
    .select("*")
    .order("score", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching user scores:", error);
    return [];
  }

  return data;
};

export const setUserScore = async (
  name: string,
  score: number,
  difficulty_level: string
) => {
  const { error } = await supabase
    .from("user")
    .upsert([{ name, score, difficulty_level, date: new Date() }]);

  if (error) {
    console.error("Error setting user score:", error);
  }
};
