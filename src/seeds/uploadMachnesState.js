import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URLまたはService Keyが .env.local に設定されていません。"
  );
}

const ids = [
  "32f4f21a-228c-407b-9641-8edfc8383835",
  "557d346e-d4f7-4027-bc83-db8f78babc8f",
  "607a062c-53d8-492a-a1c1-19a05ed49032",
  "710722c1-4bd5-4b53-a1b8-8e9b61b5bc53",
  "723e9c5e-cbec-4b63-8ca1-5d9a0f9bc4bb",
  "7e783590-3d65-44d9-b159-85c43902d4d9",
  "a40a305b-4943-41fd-8424-bfba23b7205d",
  "daa9735f-f6f0-4ec4-9165-28ab65cfa04f",
];

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const updateMachines = async (id) => {
  try {
    const { data, error } = await supabase
      .from("laundry_store")
      .select("machines")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    return { error: err };
  }
};
const createMachinesState = async (id) => {
  const machineData = await updateMachines(id);

  const machines = machineData.machines.map((machine) => {
    const newObj = {
      id: machine.id,
      name: machine.name,
      break: false,
      comment: "",
    };
    return newObj;
  });

  try {
    const { error } = await supabase
      .from("laundry_state")
      .update({ machines })
      .eq("laundryId", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    return { error: err };
  }
};

ids.forEach((id) => {
  createMachinesState(id);
});
