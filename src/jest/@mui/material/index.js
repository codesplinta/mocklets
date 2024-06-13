// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    useMediaQuery: jest.fn().mockReturnValue(false)
}));
