import axios from 'axios';

let base_url = 'https://spindle-api.herokuapp.com';
if (process.env.NODE_ENV === 'development') {
  base_url = 'http://localhost';
}

const post = async (url, data, options) => {
  url = `${base_url}${url}`;
  let response;
  try {
    response = (await axios.post(url, data, options)).data;
    if (response.error) {
      throw new Error(response.message);
    }
    response = { success: true, data: response };
  } catch (error) {
    console.error(error);
    if (error.message.includes('status code 401')) {
      error.message = 'This action can only be performed from official Spindle ASA domains';
    }
    response = { success: false, data: error.message };
  }
  return response;
};

const get = async (url, options) => {
  url = `${base_url}${url}`;
  let response;
  try {
    response = (await axios.get(url, options)).data;
    if (response.error) {
      throw new Error(response.message);
    }
    response = { success: true, data: response };
  } catch (error) {
    console.error(error);
    response = { success: false, data: error.message };
  }
  return response;
};

export default { post, get };
