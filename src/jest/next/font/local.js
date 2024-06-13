/*
  NextJS's font optimization has built-in automatic self-hosting for any font file.  The optimization automatically
  downloads any Google font and places Google and local fonts into an app's static assets all at BUILD time.
  When running tests it's important to mock the module import 'next/font/google' and 'next/font/local' depending on
  which font optimization you're using.

  A mock for the function, localFont().
*/
jest.mock('next/font/local', () => function () {
  return {
    style: {
      fontFamily: 'my_font'
    }
  }
})

