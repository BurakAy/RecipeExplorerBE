const { createUser, queryUserByUsername, patchPassword, queryEmail} = require('../src/repository/user-dao');
const { register, passwordChange, createProfile,getUserByUsernamePassword  } = require('../src/service/user-service');
const { getItemByUuid } = require('../src/repository/general-dao');
const { getDatabaseItem } = require('../src/service/general-service');
jest.mock('bcrypt')
const bcrypt = require("bcrypt");
jest.mock('../src/repository/user-dao', () => {
    const originalModule = jest.requireActual('../src/repository/user-dao');

    return {
        ...originalModule,
        queryUserByUsername: jest.fn(),
        queryEmail: jest.fn(),
        createUser: jest.fn(),
        patchPassword: jest.fn(),
        postProfile: jest.fn()
    }
});

jest.mock('../src/repository/general-dao', () => {
    const originalModule = jest.requireActual('../src/repository/general-dao');

    return {
        ...originalModule,
        getItemByUuid: jest.fn()
    }
})


describe('User Service Tests', () => {
    afterEach(() => {
        // clean up mock functions after each test
        jest.clearAllMocks();
    })

    test('register should return a 200 status code for a successful register', async () => {
        const mockRequestBody = {
            username: 'david',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);
        createUser.mockReturnValueOnce({
            '$metadata': {
              httpStatusCode: 200,
              requestId: 'DS9E6PBM40118SNLH55DC8GE0JVV4KQNSO5AEMVJF66Q9ASUAAJG',
              extendedRequestId: undefined,
              cfId: undefined,
              attempts: 1,
              totalRetryDelay: 0
            }
        });

        const result = await register(mockRequestBody);

        expect(result).toHaveProperty('$metadata.httpStatusCode', 200);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    test('register should return a 200 status code for a successful register with a missing description', async () => {
        const mockRequestBody = {
            username: 'david',
            password: 'david',
            email: 'david@gmail.com',
            description: null,
            picture: 'this is optional'
        };

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);
        createUser.mockReturnValueOnce({
            '$metadata': {
              httpStatusCode: 200,
              requestId: 'DS9E6PBM40118SNLH55DC8GE0JVV4KQNSO5AEMVJF66Q9ASUAAJG',
              extendedRequestId: undefined,
              cfId: undefined,
              attempts: 1,
              totalRetryDelay: 0
            }
        });

        const result = await register(mockRequestBody);

        expect(result).toHaveProperty('$metadata.httpStatusCode', 200);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    test('register should return a 200 status code for a successful register with a missing picture', async () => {
        const mockRequestBody = {
            username: 'david',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: null
        };

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);
        createUser.mockReturnValueOnce({
            '$metadata': {
              httpStatusCode: 200,
              requestId: 'DS9E6PBM40118SNLH55DC8GE0JVV4KQNSO5AEMVJF66Q9ASUAAJG',
              extendedRequestId: undefined,
              cfId: undefined,
              attempts: 1,
              totalRetryDelay: 0
            }
        });

        const result = await register(mockRequestBody);

        expect(result).toHaveProperty('$metadata.httpStatusCode', 200);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    test('register should throw an Error when trying to register without a username', async () => {
        const reqBody = {
            username: null,
            password: 'david123',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing username');
    });

    test('register should throw an Error when trying to register without a password', async () => {
        const reqBody = {
            username: 'david123',
            password: null,
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing password');
    });

    test('register should throw an Error when trying to register without an email', async () => {
        const reqBody = {
            username: 'david123',
            password: 'david123',
            email: null,
            description: 'this can be null',
            picture: 'this is optional'
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing email');
    });

    test('register should throw an Error when trying to register an already existing username', async () => {
        const reqBody = {
            username: 'david123',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        queryUserByUsername.mockReturnValueOnce({
            password: 'david',
            username: 'david123',
            email: 'david@gmail.com',
            creation_date: 1726686455,
            employee_id: '52caac7a-e48f-4587-9eac-c87422f4ba89'
        });

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('user with username already exists!');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
    });

    test('register should throw an Error when trying to register with an email that is already used', async () => {
        const reqBody = {
            username: 'david123',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        queryEmail.mockReturnValueOnce({
            email: 'david@gmail.com',
            uuid: '04d196d1-7420-4da8-abd6-0e40aba3fd95'
        });

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('email used already');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
    });

    test('login should return an object with uuid and username', async () => {
        const username = 'Dolly56';
        const password = 'vwAxtVTccddYBEf';

        queryUserByUsername.mockReturnValueOnce({
            uuid: '3c7f765b-2a79-4d90-9754-188073279f0c',
            username: 'Dolly56',
            password: '$2b$10$jzI6dBKtOt45QYITHcxEpu4.wMKBvUPJq3xM9fEcGnRHHL69LE/1q',
            email: 'Amely.Sporer@gmail.com',
            description: 'Qui incidunt ab minus quia debitis inventore enim et possimus.',
            picture: 'http://placeimg.com/640/480'
        });

        bcrypt.compare.mockResolvedValue(true);

        const account = await getUserByUsernamePassword(username, password);
        
        expect(account).toHaveProperty('uuid', '3c7f765b-2a79-4d90-9754-188073279f0c');
        expect(account).toHaveProperty('username', 'Dolly56');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    test('password should throw error if typed password is not matched with a current password in database', async() => {
        const token = {
            uuid: "validToken"
        }
        
        const reqBody = {
            password: 'wrongPassword',
            newPassword: 'newPassowrd'
        };

        getItemByUuid.mockReturnValueOnce({
            uuid: "validToken",
            password: 'rightpassword'
        });

        bcrypt.compare.mockResolvedValue(false);

        expect(async() => {
            await passwordChange(reqBody, token.uuid);
        }).rejects.toThrow("password is not correct");
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
    })

    test('metadata should be return upon successful change of password', async() => {
        const token = {
            uuid: 'validToken'
        }

        const reqBody = {
            password: 'rightPassword',
            newPassword: 'newPassword'
        }

        getItemByUuid.mockReturnValueOnce({
            uuid: 'validToken',
            password: 'rightPassword'
        });
        bcrypt.compare.mockResolvedValue(true);
        const result = await passwordChange(reqBody, token.uuid);

        expect(result).not.toBe(null);
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
        expect(patchPassword).toHaveBeenCalledTimes(1);
    })
 
    test('get profile should return every information except password and null', async() => {
        
        //null description and empty picture
        //should return as it is except password
        const uuidParam = 'validPassword'

        getItemByUuid.mockReturnValueOnce({
            uuid: 'validUuid',
            password: 'password',
            username: 'user1',
            email: 'user1@email.com',
            picture: "",
            description: null,

        });

        const expectResult = {
            uuid: 'validUuid',
            username: 'user1',
            email:'user1@email.com',
            picture: "",
            description: null,
        }

        const result = await getDatabaseItem(uuidParam);

        expect(result).toEqual(expectResult);
        expect(getItemByUuid).toHaveBeenCalledTimes(1);

    });

    test('update profile upon providing differnt username and email from database and, differnt current username and email', async() => {
        
        const token = {
            uuid: "validUuid"
        };
        
        //user provided different username and email that is different from current username and email 
        const reqBody = {
            email:"newEmail",
            description: "desciprtion",
            username: "newName",
            picture: "www.picture.com"
        };

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);

        //not a already using username by a user
        getItemByUuid.mockReturnValueOnce({
            uuid: "validUuid",
            username:"differentEmail",
            email: "differentEmail"
        });

        const result = await createProfile(reqBody, token.uuid);
        expect(result).not.toBe(null);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
    })

    test('update profile upon providing differnt username and email from database but same current username and email ', async() => {
        
        const token = {
            uuid: "validUuid"
        };
        
        //user provided different username and email that is different from current username and email 
        const reqBody = {
            email:"user2@email.com",
            description:"desciprtion",
            username:"user2",
            picture:"www.picture.com"
        };

        //already existing username in database

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);

        //update with already using username and email by a user
        getItemByUuid.mockReturnValueOnce({
            uuid: "validUuid",
            username:"user2",
            email:"user2@email.com"
        });

        const result = await createProfile(reqBody, token.uuid);
        expect(result).not.toBe(null);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
    })
    
    test('updating profile with empty email should throw error', async()=> {
        
        const token = {
            uuid: "validUuid"
        }

        const reqBody ={
            email:"",
            description: "desciprtion",
            username: 'user1',
            picture: "www.picture.com"
        }

        expect(async() => {
            await createProfile(reqBody, token.uuid);
        }).rejects.toThrow('missing email');

    })

    test("updating profile with empty username should throw error", async() => {

        const token = {
            uuid: "validUuid"
        }

        const reqBody ={
            email:"user1.email.com",
            description: "desciprtion",
            username: '',
            picture: "www.picture.com"
        }

        expect(async() => {
            await createProfile(reqBody, token.uuid);
        }).rejects.toThrow('missing username');
    })

    test("updating profile with exiting username in databae and, it is not the same name as current username should throw error", async() => {
        
        const token = {
            uuid: "validUuid"
        }
        
        //user provided update
        const reqBody = {
            email:"user1@email.com",
            description: "desciprtion",
            username: 'user1',
            picture: "www.picture.com"
        }

        //already existing username in database
        const mockValue = {
            username:'user1',
            password:'hashedPasword',
            email:"user2@email.com",
            description: null,
            picture: null
        }

        queryUserByUsername.mockReturnValueOnce(mockValue);
        queryEmail.mockReturnValueOnce(mockValue);

        //not a already using username by a user
        getItemByUuid.mockReturnValueOnce({
            uuid: "validUuid",
            username:"something different",
            email: "something different"
        })

        expect(async() => {
            await createProfile(reqBody, token.uuid);
        }).rejects.toThrow('user with this username already exists!');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);

    });

    test("updating profile with exiting email which is not the same email as current user email should throw error", async() => {
        
        const token = {
            uuid: "validUuid"
        }
        
        //user provided update
        const reqBody = {
            email:"user1@email.com",
            description: "desciprtion",
            username: 'user1',
            picture: "www.picture.com"
        }

        //already existing email in database
        const mockValue = {
            username:'user3',
            password:'hashedPasword',
            email:"user1@email.com",
            description: null,
            picture: null
        }

        queryEmail.mockReturnValueOnce(mockValue);

        //not a already using email by a user
        getItemByUuid.mockReturnValueOnce({
            uuid: "validUuid",
            email:"something_Different",
            username: "something_Differnet"
        })

        expect(async() => {
            await createProfile(reqBody, token.uuid);
        }).rejects.toThrow('this email already exist')
        
    }); 
});

