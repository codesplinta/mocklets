jest
  .spyOn(self ? self : global, 'Date')
  .mockImplementationOnce((dateString) => new Date(dateString));

jest
    .spyOn(self ? self.Date : global.Date, 'now')
    .mockImplementationOnce((dateString) =>
      (new Date(dateString)).valueOf()
    );
