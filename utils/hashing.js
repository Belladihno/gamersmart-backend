import { hash, compare } from "bcryptjs";

const doHash = (value, saltvalue) => {
  const result = hash(value, saltvalue);
  return result;
};

const doHashValidation = (value, saltvalue) => {
  const result = compare(value, saltvalue);
  return result;
};

export default { doHash, doHashValidation };
