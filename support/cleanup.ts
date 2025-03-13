import { deleteAllTestTenants } from "./apiHelpers";

// Example function you want to run
async function run() {
  await deleteAllTestTenants(); // Call the function you want to run
}

if (require.main === module) {
  run().catch((err) => console.error(err));
}
