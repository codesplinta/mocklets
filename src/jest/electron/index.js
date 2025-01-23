export const fakeElectronPackageFactory = () => {
    return ({
        app: {
          on: jest.fn(),
          whenReady: () => Promise.resolve(),
        },
        BrowserWindow: () => ({
          // partial mocks.
        }),
    });
};