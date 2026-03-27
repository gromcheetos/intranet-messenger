package com.hkapp.module.common.util;

import com.hkapp.module.common.vo.LoginInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

public class CommonUtil {
    private static final String LOGIN_INFO_KEY = "loginInfo";
    public static LoginInfo getLoginInfo() {
        HttpServletRequest request = getRequest();
        if (request == null) {
            return null;
        }
        HttpSession session = request.getSession(false);
        if (session != null) {
            LoginInfo info = (LoginInfo) session.getAttribute(LOGIN_INFO_KEY);
            if (info != null) return info;
        }

        return getLoginInfoFromSecurityContext();
    }
    public static HttpServletRequest getRequest() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs == null) return null;
        return (HttpServletRequest) attrs.resolveReference(RequestAttributes.REFERENCE_REQUEST);
    }

    public static LoginInfo getLoginInfo(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            LoginInfo info = (LoginInfo) session.getAttribute(LOGIN_INFO_KEY);
            if (info != null) return info;
        }
        return getLoginInfoFromSecurityContext();
    }

    public static String getLoginId() {
        LoginInfo info = getLoginInfo();
        return info != null ? info.getLoginId() : null;
    }

    private static LoginInfo getLoginInfoFromSecurityContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        // principal name is userId (set in CustomUserDetailsService)
        String userId = auth.getName();
        if (userId == null || userId.equals("anonymousUser")) return null;

        // Only userId is available here — use getLoginInfo(request) for full info
        return LoginInfo.builder()
                .loginId(userId)
                .build();
    }

}
