import { expect } from "chai"
import * as sinon from "sinon"

import { fetchUsername, settingsFetchUserFromKeychain } from "../settings-fetch-user-from-keychain"
import { settingsSetUsername } from "../settings-set-username"
import { settingsLogoutUser } from "../settings-logout-user"

const nock = require("nock")
const keytar = require("keytar")

const ACCESS_TOKEN = "token"

describe("Keychain User Lookup Tests", () => {
  let cloneURLMock, dispatch

  beforeEach(() => {
    dispatch = sinon.spy()
    sinon.stub(keytar, "getPassword").returns(ACCESS_TOKEN)

    cloneURLMock = nock("http://classroom.github.com")
      .get("/api/internal/user")
      .query({access_token: ACCESS_TOKEN})
  })

  afterEach(() => {
    keytar.getPassword.restore()
  })

  describe("#fetchUsername", () => {
    it("returns username if returned", async () => {
      cloneURLMock.reply(200, {
        username: "test-username"
      })
      const response = await fetchUsername(ACCESS_TOKEN)
      expect(response).to.eq("test-username")
    })

    it("returns null if no username is returned", async () => {
      cloneURLMock.reply(200, { })
      const response = await fetchUsername(ACCESS_TOKEN)
      expect(response).to.be.null
    })

    it("returns null if request errors", async () => {
      cloneURLMock.replyWithError({ })

      const response = await fetchUsername(ACCESS_TOKEN)
      expect(response).to.be.null
    })

    it("returns null if response status code is 200", async () => {
      cloneURLMock.reply(403, {
        username: "bogus"
      })

      const response = await fetchUsername(ACCESS_TOKEN)
      expect(response).to.be.null
    })
  })

  describe("#settingsFetchUserFromKeychain", () => {
    beforeEach(() => {
      cloneURLMock.reply(200, {
        username: "test-username"
      })
    })

    it("returns username when its in keychain", async () => {
      const response = await settingsFetchUserFromKeychain()(dispatch)
      expect(response).to.eq("test-username")
    })

    it("dispatches set username when its in keychain", async () => {
      await settingsFetchUserFromKeychain()(dispatch)
      expect(dispatch.calledWithMatch(settingsSetUsername("test-username"))).is.true
    })

    it("dispatches logout when no username is in keychain", async () => {
      keytar.getPassword.returns(null)
      await settingsFetchUserFromKeychain()(dispatch)
      expect(dispatch.calledWithMatch(settingsLogoutUser())).is.true
    })

    it("dispatches logout when no username is in keychain", async () => {
      keytar.getPassword.returns(null)
      await settingsFetchUserFromKeychain()(dispatch)
      expect(dispatch.calledWithMatch(settingsLogoutUser())).is.true
    })

    it("dispatches logout when fetch user fails", async () => {
      cloneURLMock.reply(403, { })
      await settingsFetchUserFromKeychain()(dispatch)

      expect(dispatch.calledWithMatch(settingsLogoutUser())).is.true
    })
  })
})
