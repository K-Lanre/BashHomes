import { handleInquiry } from '../server/inquiries.mjs';

export default {
  fetch(request) {
    return handleInquiry(request, process.env);
  },
};
