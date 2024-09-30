import {
  provisionFakeBrowserSessionStorageForTests,
  provisionFakeDateForTests,
  $EXECUTION
} from '../../../../index';
  
import greetingMaker from '../';
  
describe('{greetingMaker(..)} | Unit Test Suite', () => {
  
    const ticker = provisionFakeDateForTests(
      new Date(2024, 0, 2, 12, 34, 55),
      $EXECUTION.IGNORE_RESET_AFTER_EACH_TEST_CASE
    );
  
    provisionFakeBrowserSessionStorageForTests(
      $EXECUTION.RESET_AFTER_EACH_TEST_CASE
    )
  
    test('it should return the correct greeting text given no valid format', () => {
      expect(greetingMaker('Diana Obiora', 'Miss.')).toBe(
        'Good afternoon, Miss. Diana Obiora'
      )
    });
  
    test('it should return the correct greeting text given a valid format', () => {
      const timekeeper = ticker.timePiece;

      timekeeper.travel(new Date(2024, 1, 2, 10, 22, 27))
      window.sessionStorage.setItem('greeting:format', 'old-fashioned')
  
      expect(greetingMaker('Samuel Obiora')).toBe(
        'Good day, Mr. Samuel Obiora'
      )
    });
});