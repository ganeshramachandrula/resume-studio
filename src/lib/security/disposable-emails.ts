/**
 * Disposable / temporary email domain blocklist.
 * ~200 most-abused domains. Enough to stop casual abuse.
 */
const DISPOSABLE_DOMAINS = new Set([
  // Major disposable email providers
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'throwaway.email',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'yopmail.gq',
  'maildrop.cc', 'mailnesia.com', 'mailcatch.com', 'emailondeck.com',
  'trashmail.com', 'trashmail.me', 'trashmail.net',
  'getnada.com', 'getairmail.com', 'mohmal.com',
  '10minutemail.com', '10minutemail.net', '10minute.email',
  'minutemail.com', 'tempail.com',
  'fakeinbox.com', 'fakemail.net', 'discard.email',
  'harakirimail.com', 'mailexpire.com', 'tempinbox.com',
  'binkmail.com', 'safetymail.info', 'filzmail.com',
  'mailforspam.com', 'mailscrap.com', 'spamgourmet.com',
  'spambox.us', 'spamfree24.org', 'spamhole.com',
  'trashymail.com', 'trashymail.net', 'wegwerfmail.de',
  'wegwerfmail.net', 'wegwerfmail.org', 'wuzupmail.net',
  'jetable.com', 'jetable.fr.nf', 'jetable.net', 'jetable.org',
  'bugmenot.com', 'deadaddress.com', 'despammed.com',
  'devnullmail.com', 'dodgeit.com', 'dodgit.com',
  'e4ward.com', 'emailigo.de', 'emailmiser.com',
  'emailsensei.com', 'emailtemporario.com.br',
  'ephemail.net', 'explodemail.com', 'fastacura.com',
  'filzmail.com', 'fizmail.com', 'flyspam.com',
  'imails.info', 'inboxed.im', 'inboxed.pw',
  'incognitomail.com', 'incognitomail.net', 'incognitomail.org',
  'iPadress.com', 'jetable.pp.ua', 'kasmail.com',
  'koszmail.pl', 'kurzepost.de', 'letthemeatspam.com',
  'lhsdv.com', 'lifebyfood.com', 'lookugly.com',
  'lopl.co.cc', 'lr78.com', 'maileater.com',
  'mailexpire.com', 'mailfreeonline.com', 'mailguard.me',
  'mailin8r.com', 'mailinator.net', 'mailinator.org', 'mailinator.us',
  'mailinator2.com', 'mailincubator.com', 'mailme.ir',
  'mailme.lv', 'mailmetrash.com', 'mailmoat.com',
  'mailnull.com', 'mailshell.com', 'mailsiphon.com',
  'mailzilla.com', 'mailzilla.org', 'mbx.cc',
  'mega.zik.dj', 'meltmail.com', 'mintemail.com',
  'mmmmail.com', 'mobi.web.id', 'msgos.com',
  'mt2015.com', 'mx0.wwwnew.eu', 'mypartyclip.de',
  'myphantom.com', 'myspaceinc.com', 'myspaceinc.net',
  'myspacepimpedup.com', 'mytemp.email', 'mytempemail.com',
  'nepwk.com', 'nervmich.net', 'nervtansen.de',
  'netmails.com', 'netmails.net', 'neverbox.com',
  'no-spam.ws', 'nobulk.com', 'noclickemail.com',
  'nogmailspam.info', 'nomail.xl.cx', 'nomail2me.com',
  'nomorespamemails.com', 'nospam.ze.tc', 'nospam4.us',
  'nospamfor.us', 'nospamthanks.info', 'nothingtoseehere.ca',
  'nowmymail.com', 'objectmail.com', 'obobbo.com',
  'oneoffemail.com', 'onewaymail.com', 'otherinbox.com',
  'ourklips.com', 'outlawspam.com', 'ovpn.to',
  'owlpic.com', 'pancakemail.com', 'pjjkp.com',
  'plexolan.de', 'pookmail.com', 'privacy.net',
  'proxymail.eu', 'prtnx.com', 'putthisinyouremail.com',
  'qq.com', 'quickinbox.com', 'rcpt.at',
  'reallymymail.com', 'recode.me', 'recursor.net',
  'regbypass.com', 'regbypass.comsafe-mail.net',
  'rejectmail.com', 'rhyta.com', 'rklips.com',
  'rmqkr.net', 's0ny.net', 'safe-mail.net',
  'safersignup.de', 'safetypost.de', 'sandelf.de',
  'saynotospams.com', 'scatmail.com', 'schafmail.de',
  'selfdestructingmail.com', 'sendspamhere.com', 'shiftmail.com',
  'shitmail.me', 'shortmail.net', 'sibmail.com',
  'skeefmail.com', 'slaskpost.se', 'slipry.net',
  'slopsbox.com', 'smashmail.de', 'smellfear.com',
  'snakemail.com', 'sneakemail.com', 'snkmail.com',
  'sofimail.com', 'sogetthis.com', 'soodonims.com',
  'spam.la', 'spam.su', 'spam4.me',
  'spamavert.com', 'spambob.com', 'spambob.net',
  'spambob.org', 'spambog.com', 'spambog.de',
  'spambog.ru', 'spamcannon.com', 'spamcannon.net',
  'spamcero.com', 'spamcon.org', 'spamcorptastic.com',
  'spamcowboy.com', 'spamcowboy.net', 'spamcowboy.org',
  'spamday.com', 'spamex.com', 'spamfighter.cf',
  'spamfighter.ga', 'spamfighter.gq', 'spamfighter.ml',
  'spamfighter.tk', 'spamfree.eu', 'spamfree24.com',
  'spamfree24.de', 'spamfree24.eu', 'spamfree24.info',
  'spamfree24.net', 'spamgoes.in', 'spaml.com',
  'spaml.de', 'spammotel.com', 'spamobox.com',
  'spamoff.de', 'spamslicer.com', 'spamspot.com',
  'spamstack.net', 'spamthis.co.uk', 'spamthisplease.com',
  'spamtrail.com', 'spamtrap.ro', 'superrito.com',
  'suremail.info', 'teleworm.us', 'tempalias.com',
  'tempe4mail.com', 'tempemail.biz', 'tempemail.co.za',
  'tempemail.com', 'tempemail.net', 'tempinbox.co.uk',
  'tempo-mail.com', 'temporaryemail.net', 'temporaryemail.us',
  'temporaryforwarding.com', 'temporaryinbox.com',
  'temporarymailaddress.com', 'tempthe.net',
  'thankyou2010.com', 'thisisnotmyrealemail.com',
  'throwawayemailaddress.com', 'tittbit.in',
  'tmailinator.com', 'tradermail.info', 'trash-amil.com',
  'trash-mail.at', 'trash-mail.com', 'trash-mail.de',
  'trash2009.com', 'trashdevil.com', 'trashdevil.de',
  'trashemail.de', 'trashmail.at', 'trashmail.org',
  'trashmailer.com', 'trashymail.com',
  'turual.com', 'twinmail.de', 'tyldd.com',
  'uggsrock.com', 'upliftnow.com', 'uplipht.com',
  'venompen.com', 'veryreallmail.com', 'viditag.com',
  'viewcastmedia.com', 'viewcastmedia.net', 'viewcastmedia.org',
  'vomoto.com', 'vpn.st', 'vsimcard.com',
  'vubby.com', 'wasteland.rfc822.org', 'webemail.me',
  'weg-werf-email.de', 'wegwerfadresse.de',
  'wegwerfemail.com', 'wegwerfemail.de',
  'wegwerfmail.info', 'wh4f.org', 'whatiaas.com',
  'whatpaas.com', 'whyspam.me', 'wikidocuslice.com',
  'willselfdestruct.com', 'winemaven.info',
  'wronghead.com', 'wuzup.net', 'wuzupmail.net',
  'wwwnew.eu', 'xagloo.com', 'xemaps.com',
  'xents.com', 'xmaily.com', 'xoxy.net',
  'yapped.net', 'yep.it', 'yogamaven.com',
  'yuurok.com', 'zehnminutenmail.de', 'zippymail.info',
  'zoaxe.com', 'zoemail.org',
])

/**
 * Checks if the email uses a known disposable/temporary email domain.
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return false
  return DISPOSABLE_DOMAINS.has(domain)
}

/**
 * Normalizes an email address:
 * - Lowercases
 * - For Gmail: removes dots from username, strips +suffix
 * - For others: strips +suffix
 *
 * This prevents creating multiple accounts with:
 * - user+1@gmail.com, user+2@gmail.com
 * - u.s.e.r@gmail.com
 */
export function normalizeEmail(email: string): string {
  const [rawLocal, rawDomain] = email.toLowerCase().split('@')
  if (!rawLocal || !rawDomain) return email.toLowerCase()

  const domain = rawDomain.trim()

  // Strip +suffix for all providers
  const localBase = rawLocal.split('+')[0] || rawLocal

  // Gmail-specific: remove dots from username
  const gmailDomains = ['gmail.com', 'googlemail.com']
  if (gmailDomains.includes(domain)) {
    return localBase.replace(/\./g, '') + '@' + domain
  }

  return localBase + '@' + domain
}
