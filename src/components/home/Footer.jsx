import React from 'react';

const Footer = () => {
    return (
        <footer className="text-sm my-1">
            <div className="flex center justify-center space-x-44 my-2 content-center" id="footer" style={{height: 'auto'}}>

                <ul id="logo-list" className="flex center h-[4rem]">
                    <li><a target="_blank" href="http://ufl.edu"><img alt="University of Florida logo"
                                                                      className="logo-center"
                                                                      src="https://static.idigbio.org/website-static-content/logos/UFlogo-60x60.png"
                                                                      style={{paddingRight: '8px'}}/></a></li>
                    <li><a target="_blank" href="http://fsu.edu"><img alt="Florida State University logo"
                                                                      className="center"
                                                                      src="https://static.idigbio.org/website-static-content/logos/FSUlogo-60x60.png"
                                                                      style={{paddingRight: '8px'}}/></a></li>
                    <li><a target="_blank" href="http://asu.edu"><img alt="Arizona State University logo"
                                                                      className="logo-center"
                                                                      src="https://static.idigbio.org/website-static-content/logos/ASUlogo-60x60.png"
                                                                      style={{paddingRight: '8px'}}/></a></li>
                    <li><a target="_blank" href="http://flmnh.ufl.edu"><img alt="Florida Museum logo"
                                                                            className="logo-center"
                                                                            src="https://static.idigbio.org/website-static-content/logos/FMlogo-60x60.png"
                                                                            style={{paddingRight: '8px'}}/></a></li>
                    <li><a target="_blank" href="http://nsf.gov"><img alt="National Science Foundation logo"
                                                                      className="logo-center"
                                                                      src="https://static.idigbio.org/website-static-content/logos/NSFlogo-60x60.png"/></a>
                    </li>
                    <li><a target="_blank" href="http://www.gbif.org"><img alt="GBIF logo" className="logo-center"
                                                                           style={{height: '60px'}}
                                                                           src="https://static.idigbio.org/website-static-content/logos/GBIFlogo-60x60.png"/></a>
                    </li>
                </ul>

                <div className="text-gray-500">
                    <p><a className="text-blue-500" href="https://www.facebook.com/iDigBio" target="_blank">Like iDigBio on Facebook</a> | <a
                        href="https://twitter.com/iDigBio" target="_blank" className="text-blue-500">Follow iDigBio on Twitter</a></p>
                    <p>Use of this website is subject to iDigBio's&nbsp;<a className="text-blue-500"
                        href="https://www.idigbio.org/content/idigbio-terms-use-policy">Terms of Use</a>&nbsp;and&nbsp;
                        <a  className="text-blue-500"
                            href="https://www.idigbio.org/content/idigbio-service-level-agreement-sla">Service Level
                            Agreement</a>.</p>
                    <p>This page uses the <a className="text-blue-500" target="_blank" href="https://www.gbif.org/developer/registry">GBIF
                        API</a> • <a className="text-blue-500" href="http://www.google.com/analytics">Google Analytics</a> • <a className="text-blue-500"
                        href="http://www.google.com/intl/en_ALL/privacypolicy.html">Google Privacy Policy</a></p>
                </div>

                <ul id="social-list" className="flex center space-x-2">
                    <li><a target="_blank" href="https://www.facebook.com/iDigBio"><img alt="Like iDigBio on Facebook"
                                                                                        src="src/assets/facebook_logo.png"/></a>
                    </li>
                    <li><a target="_blank" href="https://twitter.com/iDigBio"><img alt="Follow iDigbio on Twitter"
                                                                                   src="src/assets/twitter_logo.png"/></a>
                    </li>
                    <li><a target="_blank" href="https://vimeo.com/idigbio"><img alt="Vimeo"
                                                                                 src="src/assets/vimeo_logo.png"/></a>
                    </li>
                    <li><a target="_blank" href="https://www.idigbio.org/rss-feed.xml"><img alt="RSS feed"
                                                                                            src="src/assets/RSS_logo.png"/></a>
                    </li>
                </ul>

            </div>
            <div className="sixteen columns text-gray-500" id="footnote">
                <p>iDigBio is funded by grants from the National Science Foundation [DBI-1115210 (2011-2018),
                    DBI-1547229 (2016-2022), & DBI-2027654 (2021-2026)]. Any opinions, findings, and conclusions or
                    recommendations expressed in this material are those of the author(s) and do not necessarily reflect
                    the views of the National Science Foundation. © 2011-2024 iDigBio</p>
            </div>

        </footer>
    )
}

export default Footer;
