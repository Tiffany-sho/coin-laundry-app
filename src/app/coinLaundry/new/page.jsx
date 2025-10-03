const Form = () => {
  return (
    <>
      <h1>登録フォーム</h1>
      <form action="/coinLaundry">
        <div>
          <label htmlFor="store">店舗名</label>
          <input type="text" name="store" id="store" />
        </div>
        <div>
          <label htmlFor="store">場所</label>
          <input type="text" name="location" id="location" />
        </div>
        <div>
          <label htmlFor="description">概要</label>
          <input type="text" name="description" id="description" />
        </div>
        <div>
          <label htmlFor="description">概要</label>
          <textarea type="text" name="description" id="description" />
        </div>
        <div>
          <label htmlFor="image">画像アップロード</label>
          <input type="file" name="image" id="image" />
        </div>

        <button>登録</button>
      </form>
    </>
  );
};

export default Form;
