const SubmitBtn = ({ text }) => {
  return (
    <button
      type='submit'
      className='btn btn-block bg-primary text-white hover:bg-primaryMedium border-0 transition-colors duration-200'
    >
      {text}
    </button>
  );
};

export default SubmitBtn;